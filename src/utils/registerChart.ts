import {
  ArcElement,
  BarElement,
  BarController,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  LineController,
  Title,
  Tooltip,
  LineElement,
  PointElement,
} from "chart.js"

let registered = false

export function registerChart() {
  if (registered) return
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    BarController,
    ArcElement,
    LineElement,
    LineController,
    PointElement,
    Colors,
    Title,
    Tooltip,
    Legend,
  )
  registered = true
}
