import quadraticFormula from "@/scenes/quadratic_formula.py?raw"
import fourierPi from "@/scenes/fourier_pi.py?raw"
import lorenzAttractor from "@/scenes/lorenz_attractor.py?raw"

export type Scene = {
  id: "quadratic" | "fourier" | "lorenz"
  titleZh: string
  titleEn: string
  blurbZh: string
  gif: string
  code: string
  sourceUrl: string
  className: "QuadraticFormula" | "FourierPi" | "LorenzAttractor"
}

export type SceneId = Scene["id"]

export const SCENES: Scene[] = [
  {
    id: "quadratic",
    titleZh: "二次方程",
    titleEn: "Quadratic Formula",
    blurbZh:
      "演示一元二次方程的求根公式。动画从标准形式出发，逐步配方并代入系数，最终得到两个根的表达式。",
    gif: `${import.meta.env.BASE_URL}showcase/quadratic_formula.gif`,
    code: quadraticFormula,
    sourceUrl:
      "https://github.com/academa-labs/manimgx/blob/main/examples/quadratic_formula.py",
    className: "QuadraticFormula",
  },
  {
    id: "fourier",
    titleZh: "傅里叶 π",
    titleEn: "Fourier Pi",
    blurbZh:
      "用傅里叶级数逼近圆周率 π。动画展示旋转矢量叠加成正弦曲线，并通过无穷级数逐项加到 π 的近似值。",
    gif: `${import.meta.env.BASE_URL}showcase/fourier_pi.gif`,
    code: fourierPi,
    sourceUrl:
      "https://github.com/academa-labs/manimgx/blob/main/examples/fourier_pi.py",
    className: "FourierPi",
  },
  {
    id: "lorenz",
    titleZh: "Lorenz 吸引子",
    titleEn: "Lorenz Attractor",
    blurbZh:
      "绘制 Lorenz 系统的三维轨迹。动画沿着蝴蝶状吸引子描绘相空间曲线，展示确定性系统对初值的敏感依赖。",
    gif: `${import.meta.env.BASE_URL}showcase/lorenz_attractor.gif`,
    code: lorenzAttractor,
    sourceUrl:
      "https://github.com/academa-labs/manimgx/blob/main/examples/lorenz_attractor.py",
    className: "LorenzAttractor",
  },
]
