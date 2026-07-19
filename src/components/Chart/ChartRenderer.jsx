import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from "chart.js";

import zoomPlugin from "chartjs-plugin-zoom";
import * as math from "mathjs";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    zoomPlugin
);

const normalizeFormula = (formula) => {
    // حذف فاصله‌های اضافی
    formula = formula.replace(/\s+/g, "");

    // توابع معتبر math.js
    const functions = [
        "sin",
        "cos",
        "tan",
        "sqrt",
        "log",
        "exp",
        "abs",
        "asin",
        "acos",
        "atan"
    ];

    // 2x -> 2*x
    formula = formula.replace(/(\d)([a-zA-Z]+)/g, (match, n, word) => {
        if (functions.includes(word)) return match;
        return `${n}*${word}`;
    });

    // x2 -> x*2
    formula = formula.replace(/([a-zA-Z])(\d)/g, "$1*$2");

    // )x -> )*x
    formula = formula.replace(/\)([a-zA-Z])/g, ")*$1");

    // )2 -> )*2
    formula = formula.replace(/\)(\d)/g, ")*$1");

    return formula;
};

export default function ChartRenderer({ data }) {

    if (!data?.equations?.length) return null;

    const start = data.domain?.start ?? -10;
    const end = data.domain?.end ?? 10;
    const step = data.domain?.step ?? 0.1;

    const labels = [];

    for (let x = start; x <= end; x += step)
        labels.push(Number(x.toFixed(4)));

    const datasets = data.equations.map((eq, index) => {

        const values = [];

        if (/^y\s*=/.test(eq.trim())) {

            let formula = normalizeFormula(
                eq.replace(/^y\s*=/i, "")
            );

            labels.forEach((x) => {
                try {
                    values.push(math.evaluate(formula, { x }));
                } catch {
                    values.push(null);
                }
            });
        }

        return {
            label: eq,
            data: values,
            borderColor: `hsl(${index * 70}, 80%, 30%)`, // رنگ تیره‌تر
            backgroundColor: `hsla(${index * 70}, 80%, 30%, 0.2)`,
            borderWidth: 4,      // ضخامت خط
            pointRadius: 0,       // حذف نقطه‌ها (اختیاری)
            pointHoverRadius: 5,
            tension: 1,           // خط صاف
            fill: false,
            spanGaps: true
        };
    });
    console.log(datasets);
    return (
        <Line
            data={{
                labels,
                datasets
            }}
            options={{
                elements: {
                    line: {
                        borderWidth: 4
                    },
                    point: {
                        radius: 1
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        position: "top"
                    },
                    tooltip: { enabled: true },
                    zoom: {
                        pan: {
                            enabled: true,
                            mode: "xy"
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: "xy"
                        }
                    }
                }
            }}
        />
    );
}