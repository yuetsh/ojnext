import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  LineElement,
  PointElement,
} from "chart.js"

const [isLoaded] = useToggle()

export function loadChart() {
  if (isLoaded.value) return
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Colors,
    Title,
    Tooltip,
    Legend,
  )
  isLoaded.value = true
}
