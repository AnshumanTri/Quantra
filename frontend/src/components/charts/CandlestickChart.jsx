import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'

export default function CandlestickChart({ candles = [], isDark }) {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const candleSeriesRef = useRef(null)
  const volumeSeriesRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || candles.length === 0) return

    // Destroy previous chart if re-rendering
    if (chartInstance.current) {
      chartInstance.current.remove()
      chartInstance.current = null
    }

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: isDark ? '#25252b' : '#ffffff' },
        textColor: isDark ? '#9ca3af' : '#6b7280',
      },
      grid: {
        vertLines: { color: isDark ? '#2e2e36' : '#f0f0f0' },
        horzLines: { color: isDark ? '#2e2e36' : '#f0f0f0' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: {
        borderColor: isDark ? '#2e2e36' : '#e0e0e0',
      },
      timeScale: {
        borderColor: isDark ? '#2e2e36' : '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    chartInstance.current = chart

    // Candlestick series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#4caf50',
      downColor: '#f44336',
      borderUpColor: '#4caf50',
      borderDownColor: '#f44336',
      wickUpColor: '#4caf50',
      wickDownColor: '#f44336',
    })

    // Volume series at the bottom
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#2196f326',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    candleSeries.setData(candles)
    volumeSeries.setData(
      candles.map(c => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? '#4caf5040' : '#f4433640',
      }))
    )

    candleSeriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries

    chart.timeScale().fitContent()

    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current && chartInstance.current) {
        chartInstance.current.applyOptions({
          width: chartRef.current.clientWidth,
        })
      }
    })
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      if (chartInstance.current) {
        chartInstance.current.remove()
        chartInstance.current = null
      }
    }
  }, [candles, isDark])

  return <div ref={chartRef} className="w-full" />
}