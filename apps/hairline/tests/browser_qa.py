"""Run against Vite dev or built preview; requires Python Playwright + Chromium.
URL defaults to http://127.0.0.1:5187/hairline/. Writes only app artifacts.
"""
import json, os, pathlib, re, time
from playwright.sync_api import sync_playwright, expect
ROOT = pathlib.Path(__file__).resolve().parents[1]
ART = ROOT / 'artifacts'
ART.mkdir(exist_ok=True)
(ART / 'catalogue').mkdir(exist_ok=True)
URL = os.environ.get('HAIRLINE_QA_URL', 'http://127.0.0.1:5187/hairline/')
report = {'url': URL, 'figures': [], 'checks': [], 'errors': []}

def ok(name):
    report['checks'].append(name)
    print('PASS', name, flush=True)

def no_overflow(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), 'horizontal overflow'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width':1440,'height':1100})
    page = context.new_page()
    page.on('pageerror', lambda error: report['errors'].append(str(error)))
    page.on('console', lambda msg: report['errors'].append(msg.text) if msg.type == 'error' else None)
    page.goto(URL)
    page.wait_for_load_state('networkidle')
    names = page.locator('[data-figure]').evaluate_all('(els) => els.map(el => el.dataset.figure)')
    assert len(names) == len(set(names)) == 19
    for name in names:
        page.locator(f'[data-figure="{name}"]').click()
        host = page.locator(f'[data-hairline="{name}"]')
        expect(host).to_have_count(1)
        expect(page.locator('[data-hairline]')).to_have_count(1)
        svg = host.locator('svg')
        assert svg.locator('path, polygon, line, circle, rect, ellipse').count() > 5
        expect(host).to_have_attribute('aria-label', re.compile('[\u4e00-\u9fff]'))
        # Check both themes and every intensity endpoint on every component.
        for theme in ['dark','light']:
            page.locator('#theme').select_option(theme)
            expect(host).to_have_attribute('data-hairline-theme', theme)
        box = host.bounding_box()
        assert box and box['width'] > 250 and box['height'] > 100
        samples = []
        for intensity, key in [(0,'Home'),(1,'End'),(.5,None)]:
            slider=page.locator('#intensity')
            if key:
                slider.focus(); slider.press(key)
            else:
                slider.fill('0.5')
            expect(page.locator('output')).to_have_text(f'{intensity:.2f}')
            for x,y in [(0.2,0.3),(0.5,0.5),(0.8,0.7)]:
                page.mouse.move(box['x']+box['width']*x,box['y']+box['height']*y,steps=4)
                page.wait_for_timeout(180)
                samples.append(page.locator('.readout code').inner_text())
        expect(page.locator('[data-testid=readout]')).not_to_be_empty()
        page.locator('.figure-body').screenshot(path=str(ART/'catalogue'/f'{name}.png'))
        report['figures'].append({'id':name,'svg_shapes':svg.locator('path, polygon, line, circle, rect, ellipse').count(),'read_samples':samples,'themes':['dark','light'],'intensity':[0,1,.5]})
        print('FIGURE',name, samples[-1],flush=True)
    ok('All 19 render SVG, Chinese accessible labels, onRead samples; light/dark and intensity 0/0.5/1')
    # Match the official seven shelves and ensure selection belongs to each filter.
    for name,count in [('界面',1),('数据',3),('机器',3),('设备',3),('开发',3),('安全',3),('连接',3)]:
        page.locator('.category-list button').filter(has_text=name).click()
        assert page.locator('[data-figure]').count()==count
        selected=page.locator('[data-figure][aria-pressed=true]')
        assert selected.count()==1
        expected=selected.get_attribute('data-figure')
        expect(page.locator('[data-hairline]')).to_have_attribute('data-hairline',expected)
    page.locator('.category-list button').filter(has_text='全部图形').click()
    page.locator('[data-figure="exploded"]').click()
    page.get_by_role('button',name='上一个图形',exact=True).click()
    expect(page.locator('[data-hairline]')).to_have_attribute('data-hairline','router')
    page.get_by_role('button',name='下一个图形',exact=True).click()
    expect(page.locator('[data-hairline]')).to_have_attribute('data-hairline','exploded')
    ok('Seven category counts, selection validity and previous/next wrap')
    page.locator('[data-figure="riffle"]').click()
    riffle=page.locator('[data-hairline=riffle]')
    riffle.focus(); riffle.press('ArrowRight'); page.wait_for_timeout(300)
    expect(page.locator('[data-testid=readout]')).to_contain_text('当前卡片')
    ok('Riffle keyboard navigation')
    page.locator('#theme').select_option('auto')
    page.emulate_media(color_scheme='dark'); expect(page.locator('html')).to_have_class('dark')
    page.emulate_media(color_scheme='light'); expect(page.locator('html')).not_to_have_class('dark')
    ok('System theme responds to preference changes')
    page.locator('[data-figure=patch]').click()
    page.locator('#theme').select_option('light')
    page.locator('h1').click()
    page.evaluate('window.scrollTo(0,0)')
    box=page.locator('[data-hairline=patch]').bounding_box()
    page.mouse.move(box['x']+box['width']*.6,box['y']+box['height']*.55,steps=8)
    page.wait_for_timeout(350)
    page.screenshot(path=str(ART/'screenshot.png'),full_page=True)
    page.locator('#theme').select_option('dark'); page.screenshot(path=str(ART/'dark.png'),full_page=True)
    no_overflow(page)
    # Collaboration: repeated start, pause, single step, reset, automatic completion.
    page.get_by_role('button',name='02 协作场景',exact=True).click()
    expect(page.locator('[data-hairline]')).to_have_count(3)
    page.get_by_role('button',name='开始演示',exact=True).click()
    # Rapid repeated clicks on disabled start must not add timers or skip steps.
    page.get_by_role('button',name='继续自动',exact=True).evaluate('(b)=>{b.click();b.click();b.click()}')
    page.get_by_role('button',name='暂停',exact=True).click()
    page.wait_for_timeout(2600)
    expect(page.locator('.handoff-log ol li')).to_have_count(1)
    expect(page.locator('.handoff-log ol li')).to_contain_text('尚无交接')
    page.get_by_role('button',name='下一步',exact=True).click()
    expect(page.locator('.handoff-log ol')).to_contain_text('Dicembre → Grok')
    expect(page.locator('.agent.current h3')).to_have_text('Grok')
    page.get_by_role('button',name='重置',exact=True).click()
    expect(page.locator('.flow-status')).to_have_text('等待开始')
    expect(page.locator('.handoff-log')).not_to_contain_text('Dicembre → Grok')
    page.get_by_role('button',name='开始演示',exact=True).click()
    page.get_by_role('button',name='重置',exact=True).click()
    page.wait_for_timeout(2600)
    expect(page.locator('.flow-status')).to_have_text('等待开始')
    page.get_by_role('button',name='开始演示',exact=True).click()
    expect(page.locator('.flow-status')).to_have_text('待人工验收',timeout=11000)
    expect(page.locator('.handoff-log ol li')).to_have_count(3)
    expect(page.locator('.agent.done')).to_have_count(3)
    expect(page.get_by_role('button',name='下一步',exact=True)).to_be_disabled()
    page.get_by_role('button',name='继续自动',exact=True).evaluate('(b)=>{b.click();b.click()}')
    expect(page.locator('.handoff-log ol li')).to_have_count(3)
    ok('Collaboration: automatic completion, duplicate start/completion, pause, manual step, reset and timer cleanup')
    page.locator('#theme').select_option('light')
    page.screenshot(path=str(ART/'collaboration.png'),full_page=True)
    page.get_by_role('button',name='重置',exact=True).click()
    page.get_by_role('button',name='开始演示',exact=True).click()
    page.get_by_role('button',name='01 组件体验',exact=True).click()
    page.wait_for_timeout(2600)
    page.get_by_role('button',name='02 协作场景',exact=True).click()
    expect(page.locator('.flow-status')).to_have_text('已暂停 · 可单步')
    expect(page.locator('.handoff-log ol li')).to_contain_text('尚无交接')
    ok('Leaving collaboration pauses and retains state')
    # All components fit at 320px. Test touch and both narrow view modes.
    mobile = browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
    mp=mobile.new_page(); mp.on('pageerror',lambda error: report['errors'].append(str(error)))
    mp.goto(URL); mp.wait_for_load_state('networkidle')
    for width in [320,390,768]:
        mp.set_viewport_size({'width':width,'height':844})
        for name in names:
            mp.locator(f'[data-figure="{name}"]').click()
            no_overflow(mp)
            assert mp.locator('[data-hairline] svg').bounding_box()['width'] > 200
        mp.get_by_role('button',name='02 协作场景',exact=True).click()
        no_overflow(mp)
        mp.get_by_role('button',name='重置',exact=True).click()
        mp.get_by_role('button',name='下一步',exact=True).click()
        mp.get_by_role('button',name='下一步',exact=True).click()
        expect(mp.locator('.handoff-log ol')).to_contain_text('Dicembre → Grok')
        mp.get_by_role('button',name='01 组件体验',exact=True).click()
    mp.set_viewport_size({'width':390,'height':844})
    mp.locator('[data-figure=terrain]').click()
    mp.locator('[data-hairline=terrain]').tap()
    mp.wait_for_timeout(350)
    expect(mp.locator('[data-testid=readout]')).to_contain_text('单元')
    mp.screenshot(path=str(ART/'mobile.png'),full_page=True)
    mp.get_by_role('button',name='02 协作场景',exact=True).click()
    mp.screenshot(path=str(ART/'mobile-collaboration.png'),full_page=True)
    ok('320/390/768px: all 19 SVGs, no horizontal overflow, touch readout and collaboration controls')
    mobile.close()
    # Reduced motion loops should hold while direct pointer input remains available.
    page.get_by_role('button',name='01 组件体验',exact=True).click()
    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.motion-mode')).to_have_text('减少动态效果已启用')
    for name in names:
        page.locator(f'[data-figure="{name}"]').click(); no_overflow(page)
        expect(page.locator('[data-hairline] svg')).to_have_count(1)
    for name in ['phosphor','slow']:
        page.locator(f'[data-figure="{name}"]').click()
        page.mouse.move(10,10); page.wait_for_timeout(500)
        first=page.locator('[data-hairline] svg').inner_html()
        page.wait_for_timeout(650)
        assert page.locator('[data-hairline] svg').inner_html()==first, f'{name}: idle loop did not stop'
    page.get_by_role('button',name='02 协作场景',exact=True).click()
    page.get_by_role('button',name='重置',exact=True).click()
    for _ in range(4): page.get_by_role('button',name='下一步',exact=True).click()
    expect(page.locator('.flow-status')).to_have_text('待人工验收')
    ok('Reduced motion: all SVGs render; Phosphor/Slow idle loops stop; manual collaboration completes')
    assert not report['errors'], report['errors']
    ok('No browser console/page errors')
    context.close()
    # A short, clean recording intended for PR evidence.
    video_context=browser.new_context(viewport={'width':1280,'height':960},record_video_dir=str(ART/'video-tmp'),record_video_size={'width':1280,'height':960})
    vp=video_context.new_page(); vp.goto(URL); vp.wait_for_load_state('networkidle')
    vp.wait_for_timeout(600)
    for name in ['exploded','patch','dish','riffle']:
        vp.locator(f'[data-figure="{name}"]').click()
        box=vp.locator('[data-hairline]').bounding_box()
        vp.mouse.move(box['x']+box['width']*.3,box['y']+box['height']*.3)
        vp.mouse.move(box['x']+box['width']*.75,box['y']+box['height']*.7,steps=25)
        vp.wait_for_timeout(500)
    vp.locator('#theme').select_option('dark'); vp.wait_for_timeout(600)
    vp.locator('#intensity').fill('1'); vp.wait_for_timeout(500)
    vp.get_by_role('button',name='02 协作场景',exact=True).click()
    vp.get_by_role('button',name='开始演示',exact=True).click()
    expect(vp.locator('.flow-status')).to_have_text('待人工验收',timeout=11000)
    vp.wait_for_timeout(900)
    video=vp.video
    video_context.close(); video.save_as(str(ART/'demo.webm'))
    video.delete()
    (ART/'video-tmp').rmdir()
    browser.close()
report['result']='passed'
(ART/'qa-results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print('ALL PASS',flush=True)
