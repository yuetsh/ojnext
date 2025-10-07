import confetti from "canvas-confetti"

/**
 * 随机烟花效果 Composable
 * 提供7种不同风格的烟花庆祝效果
 */
export function useFireworks() {
  /**
   * 触发随机烟花效果
   */
  function celebrate() {
    const fireworkTypes = [
      // 效果1: 经典烟花秀
      () => {
        const duration = 3000
        const animationEnd = Date.now() + duration
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        }

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50 * (timeLeft / duration)
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() - 0.2 },
            colors: ["#ff6b6b", "#ffd93d", "#6bcf7f", "#4ecdc4", "#a29bfe"],
          })
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
            colors: ["#ff6b6b", "#ffd93d", "#6bcf7f", "#4ecdc4", "#a29bfe"],
          })
        }, 250)
      },

      // 效果2: 星星雨
      () => {
        const count = 10
        const defaults = {
          origin: { y: 0.7 },
          shapes: ["star"],
          colors: ["#FFD700", "#FFA500", "#FFFF00", "#FF69B4", "#00CED1"],
        }

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(200 * particleRatio),
          })
        }

        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
      },

      // 效果3: 爆炸波浪
      () => {
        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min
        }

        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            confetti({
              angle: randomInRange(55, 125),
              spread: randomInRange(50, 70),
              particleCount: randomInRange(50, 100),
              origin: { y: 0.6 },
              colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42"],
            })
          }, i * 200)
        }
      },

      // 效果4: 彩虹喷泉
      () => {
        const end = Date.now() + 2000

        const colors = ["#bb0000", "#ffffff"]

        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          })
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          })

          if (Date.now() < end) {
            requestAnimationFrame(frame)
          }
        }

        frame()
      },

      // 效果5: 烟花雨
      () => {
        const duration = 2500
        const animationEnd = Date.now() + duration

        const interval: any = setInterval(() => {
          const timeLeft = animationEnd - Date.now()
          if (timeLeft <= 0) return clearInterval(interval)

          const particleCount = 50
          confetti({
            particleCount,
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            origin: {
              x: Math.random(),
              y: Math.random() - 0.2,
            },
            colors: [
              "#ff0000",
              "#00ff00",
              "#0000ff",
              "#ffff00",
              "#ff00ff",
              "#00ffff",
            ],
          })
        }, 200)
      },

      // 效果6: 炮竹齐鸣
      () => {
        const count = 200
        const defaults = {
          origin: { y: 0.7 },
        }

        function fire(particleRatio: number, opts: any) {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          })
        }

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        })

        fire(0.2, {
          spread: 60,
        })

        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        })

        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        })

        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        })
      },

      // 效果7: 螺旋上升
      () => {
        const defaults = {
          spread: 360,
          ticks: 100,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
        }

        function shoot() {
          confetti({
            ...defaults,
            particleCount: 50,
            scalar: 1.2,
            shapes: ["circle", "square"],
            colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
          })
        }

        setTimeout(shoot, 0)
        setTimeout(shoot, 100)
        setTimeout(shoot, 200)
        setTimeout(shoot, 300)
        setTimeout(shoot, 400)
      },
    ]

    // 随机选择一种效果
    const randomEffect =
      fireworkTypes[Math.floor(Math.random() * fireworkTypes.length)]
    randomEffect()
  }

  return {
    celebrate,
  }
}
