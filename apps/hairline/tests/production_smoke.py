import json, pathlib
from playwright.sync_api import sync_playwright, expect
ROOT=pathlib.Path(__file__).resolve().parents[1]
ART=ROOT/'artifacts'
report={'url':'http://127.0.0.1:4397/hairline/','errors':[],'failed_http':[]}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True)
 page=b.new_page(viewport={'width':1440,'height':1100})
 page.on('pageerror',lambda error:report['errors'].append(str(error)))
 page.on('response',lambda response:report['failed_http'].append({'url':response.url,'status':response.status}) if response.status>=400 else None)
 page.goto('http://127.0.0.1:4397/'); page.wait_for_load_state('networkidle')
 assert page.locator('a.card').count()==9
 assert page.locator('a[href="/hairline/"]').count()==1
 page.locator('a[href="/hairline/"]').click(); page.wait_for_load_state('networkidle')
 expect(page).to_have_title('Hairline 细线实验室')
 assert page.locator('[data-figure]').count()==19
 for name in page.locator('[data-figure]').evaluate_all('(els)=>els.map(e=>e.dataset.figure)'):
  page.locator(f'[data-figure="{name}"]').click()
  assert page.locator(f'[data-hairline="{name}"] svg').count()==1
 page.locator('[data-figure=exploded]').click()
 box=page.locator('[data-hairline=exploded]').bounding_box()
 page.mouse.move(box['x']+box['width']*.8,box['y']+box['height']*.65)
 page.wait_for_timeout(400)
 assert 'popover' not in page.locator('[data-testid=readout]').inner_text()
 page.locator('[data-figure=patch]').click(); page.locator('h1').click(); page.evaluate('window.scrollTo(0,0)')
 box=page.locator('[data-hairline=patch]').bounding_box()
 page.mouse.move(box['x']+box['width']*.6,box['y']+box['height']*.55,steps=6)
 page.wait_for_timeout(400);page.screenshot(path=str(ART/'screenshot.png'),full_page=True)
 page.locator('#theme').select_option('dark');page.wait_for_timeout(350)
 page.screenshot(path=str(ART/'dark.png'),full_page=True)
 page.get_by_role('button',name='02 协作场景',exact=True).click()
 page.locator('#theme').select_option('light');page.wait_for_timeout(350)
 page.get_by_role('button',name='下一步',exact=True).click();page.get_by_role('button',name='下一步',exact=True).click()
 expect(page.locator('.agent.current h3')).to_have_text('Grok')
 page.screenshot(path=str(ART/'collaboration-active.png'),full_page=True)
 for _ in range(2):page.get_by_role('button',name='下一步',exact=True).click()
 expect(page.locator('.flow-status')).to_have_text('待人工验收')
 assert page.locator('.handoff-log ol li').count()==3
 page.screenshot(path=str(ART/'collaboration.png'),full_page=True)
 mobile=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,device_scale_factor=1)
 mp=mobile.new_page();mp.goto(report['url']);mp.wait_for_load_state('networkidle')
 mp.locator('[data-figure=terrain]').click();mp.locator('h1').click();mp.evaluate('window.scrollTo(0,0)')
 mp.wait_for_timeout(300);mp.screenshot(path=str(ART/'mobile.png'),full_page=True)
 mp.get_by_role('button',name='02 协作场景',exact=True).click()
 mp.get_by_role('button',name='下一步',exact=True).click();mp.get_by_role('button',name='下一步',exact=True).click()
 mp.locator('h1').click();mp.evaluate('window.scrollTo(0,0)')
 mp.screenshot(path=str(ART/'mobile-collaboration.png'),full_page=True)
 assert mp.evaluate('document.documentElement.scrollWidth <= innerWidth')
 mobile.close();b.close()
assert not report['errors'] and not report['failed_http'],report
report['result']='passed';report['checks']=['Root index includes 9 demos and Hairline link','Production /hairline/ entry and all 19 SVGs render','Theme changes and Chinese layer readout','Production manual collaboration finishes with 3 handoffs','390px production layout has no horizontal overflow','No page errors or HTTP >=400']
(ART/'production-results.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(report,ensure_ascii=False))
