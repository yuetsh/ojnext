import {
  Chart as ChartJS,
  Title,
  Colors,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js"

const [isLoaded] = useToggle()

export function loadChart() {
  if (isLoaded.value) return
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Colors,
    Title,
    Tooltip,
    Legend
  )
  isLoaded.value = true
}
