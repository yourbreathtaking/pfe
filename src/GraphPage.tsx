import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { translations, type Language } from "./translations";
import { polygons } from "./data"; // Correct import path

interface GraphPageProps {
  language: Language;
  isDarkMode: boolean;
  isFirstGraphVisit: boolean; // Prop to receive first visit status
  setIsFirstGraphVisit: (isFirst: boolean) => void; // Prop to update first visit status
  onClose: () => void;
}

const chartColors = [
  "rgba(255, 99, 132, 0.6)", // Red
  "rgba(54, 162, 235, 0.6)", // Blue
  "rgba(255, 206, 86, 0.6)", // Yellow
  "rgba(75, 192, 192, 0.6)", // Green
  "rgba(153, 102, 255, 0.6)", // Purple
  "rgba(255, 159, 64, 0.6)", // Orange
  "rgba(199, 199, 199, 0.6)", // Gray
  "rgba(83, 102, 255, 0.6)", // Indigo
  "rgba(162, 235, 54, 0.6)", // Lime green
  "rgba(235, 54, 162, 0.6)", // Pink
];

const chartBorderColors = [
  "rgba(255, 99, 132, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(199, 199, 199, 1)",
  "rgba(83, 102, 255, 1)",
  "rgba(162, 235, 54, 1)",
  "rgba(235, 54, 162, 1)",
];

const dataCategories = {
  Demography: [
    "pop2024",
    "pop2024 M",
    "pop2024 F",
    "%pop-15",
    "%pop-15 M",
    "%pop-15 F",
    "%pop15-59",
    "%p15-59 M",
    "%p15-59 F",
    "%pop+60",
    "%pop+60 M",
    "%pop+60 F",
    "%p celi+15",
    "%p ce+15 M",
    "%p ce+15 F",
    "%p mari+15",
    "%p mr+15 M",
    "%p mr+15 F",
    "%p div+15",
    "%p dv+15 M",
    "%p dv+15 F",
    "%p vf+15",
    "%p vf+15 M",
    "%p vf+15 F",
    "age 1r mar",
    "age 1r m M",
    "age 1r m F",
    "Parite 45-",
    "ISF",
  ],
  Health: ["%pre handi", "%pre han M", "%pre han F"],
  education: [
    "%ana10",
    "%ana10_M",
    "%ana10_F",
    "%ar",
    "%ar_M",
    "%ar_F",
    "%arfr",
    "%arfr_M",
    "%arfr_F",
    "%arfang",
    "%arfang_M",
    "%arfang_F",
    "%sco611",
    "%sco611_M",
    "%sco611_F",
    "%niv0",
    "%niv0_M",
    "%niv0_F",
    "%pre",
    "%pre_M",
    "%pre_F",
    "%pri",
    "%pri_M",
    "%pri_F",
    "%secC",
    "%secC_M",
    "%secC_F",
    "%secQ",
    "%secQ_M",
    "%secQ_F",
    "%sup",
    "%sup_M",
    "%sup_F",
  ],
  langues: ["%LM_ar", "%LM_ar_M", "%LM_ar_F", "%LM_am", "%LM_am_M", "%LM_am_F"],
  emploi: [
    "%act15",
    "%act15_M",
    "%act15_F",
    "%chom",
    "%chom_M",
    "%chom_F",
    "%emp",
    "%emp_M",
    "%emp_F",
    "%ind",
    "%ind_M",
    "%ind_F",
    "%sal",
    "%sal_M",
    "%sal_F",
    "%aid",
    "%aid_M",
    "%aid_F",
    "%apr",
    "%apr_M",
    "%apr_F",
    "%ass",
    "%ass_M",
    "%ass_F",
  ],
  menages: [
    "Men_Nb",
    "Men_Tai",
    "Vil_%",
    "App_%",
    "MaiM_%",
    "MaiS_%",
    "LogR_%",
    "Occup_%",
    "Prop_%",
    "Loc_%",
    "Cuis_%",
    "WC_%",
    "Bain_%",
    "Eau_%",
    "Elec_%",
    "EauP_%",
    "EauF_%",
    "Log_10-%",
    "Log10_19",
    "Log20_49",
    "Log_50+",
  ],
  economie: ["EE_Tot", "EE_Pub", "EE_Ass", "EE_Sou", "EE_Luc", "EE_Empl"],
  secac: ["EE_Ind", "EE_Con", "EE_Com", "EE_Ser"],
  cl_emp: ["EE_E1", "EE_E2", "EE_E4", "EE_E10", "EE_E50"],
  creation: [
    "EE_1956",
    "EE_5680",
    "EE_8190",
    "EE_9100",
    "EE_0110",
    "EE_1119",
    "EE_20+",
  ],
};

const GraphPage: React.FC<GraphPageProps> = ({
  language,
  isDarkMode,
  isFirstGraphVisit,
  setIsFirstGraphVisit,
  onClose,
}) => {
  const t = translations[language];

  const [selectedGraphCategory, setSelectedGraphCategory] =
    useState<string>("");
  const [selectedGraphIndicator, setSelectedGraphIndicator] =
    useState<string>("");
  const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);
  const [isCommuneListExpanded, setIsCommuneListExpanded] = useState(false);
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  // --- Simple Tutorial State and Logic ---
  // No need for a separate showSimpleGraphTour state, directly use isFirstGraphVisit prop
  const handleDismissSimpleTour = () => {
    setIsFirstGraphVisit(false); // Mark graph page as visited in parent component
  };
  // --- End Simple Tutorial Logic ---

  // Chart resizing logic
  const resizeChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.resize();
    }
  };

  // Effect to destroy and re-create chart
  useEffect(() => {
    if (
      chartRef.current &&
      selectedGraphIndicator &&
      selectedCommunes.length > 0 &&
      selectedGraphCategory
    ) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const data = selectedCommunes.map((communeName) => {
          const commune = polygons.find(
            (p) => p.name === communeName && p.layer === "commune"
          );
          return commune ? Number(commune[selectedGraphIndicator]) || 0 : 0;
        });

        const backgroundColors = data.map(
          (_, index) => chartColors[index % chartColors.length]
        );
        const borderColors = data.map(
          (_, index) => chartBorderColors[index % chartBorderColors.length]
        );

        chartInstanceRef.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: selectedCommunes.map((name) => t[name]),
            datasets: [
              {
                label: t[selectedGraphIndicator as keyof typeof t],
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 500,
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
                grid: { color: isDarkMode ? "#444444" : "#e5e7eb" },
              },
              x: {
                ticks: { color: isDarkMode ? "#ffffff" : "#000000" },
                grid: { display: false },
              },
            },
            plugins: {
              legend: {
                display: false, // Hide the legend
              },
              title: {
                display: true,
                text: `${t.comparaison} ${
                  t[selectedGraphIndicator as keyof typeof t]
                }`,
                color: isDarkMode ? "#ffffff" : "#000000",
                font: { size: 16 },
              },
            },
          },
        });
      }
    } else {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [
    selectedGraphIndicator,
    selectedCommunes,
    isDarkMode,
    language,
    t,
    selectedGraphCategory,
  ]);

  // Effect to handle chart resizing when its container changes
  useEffect(() => {
    let observer: ResizeObserver;
    if (chartContainerRef.current) {
      observer = new ResizeObserver(resizeChart);
      observer.observe(chartContainerRef.current);
    }
    resizeChart(); // Initial resize call to ensure chart fills space immediately

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [isChartExpanded, selectedGraphIndicator]);

  const handleCommuneToggle = (communeName: string) => {
    setSelectedCommunes((prev) => {
      if (prev.includes(communeName)) {
        return prev.filter((name) => name !== communeName);
      } else {
        return [...prev, communeName];
      }
    });
  };

  const communeListHeightClass = isCommuneListExpanded
    ? "max-h-[300px]"
    : "max-h-40";

  return (
    <div
      className={
        `flex flex-col flex-1 p-6 rounded-xl shadow-2xl overflow-y-auto relative ` +
        (isDarkMode
          ? "bg-gray-800 text-white scrollbar-dark"
          : "bg-white text-black scrollbar-light")
      }
    >
      {/* Simple Welcome Message for Graph Page - Controlled by isFirstGraphVisit prop */}
      {isFirstGraphVisit && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center">
          <div
            className={`
              p-8 rounded-xl shadow-2xl text-center max-w-md
              ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }
              transition-all duration-300
            `}
          >
            <h3 className="text-2xl font-bold mb-4">
              {t.graphSimpleTourTitle}
            </h3>
            <p className="mb-6 text-lg leading-relaxed">
              {t.graphSimpleTourContent}
            </p>
            <button
              onClick={handleDismissSimpleTour}
              className={`px-6 py-3 rounded-lg ${
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-blue-700 hover:bg-blue-800 text-white"
              }`}
            >
              {t.okBtn}
            </button>
          </div>
        </div>
      )}
      {/* End Simple Welcome Message */}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">{t.graphComparison}</h3>
        <button
          onClick={onClose}
          className={`p-1 rounded-full ${
            isDarkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <label
          className={`block mb-2 font-medium ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          {t.selectSection}
        </label>
        <select
          value={selectedGraphCategory}
          onChange={(e) => {
            setSelectedGraphCategory(e.target.value);
            setSelectedGraphIndicator("");
          }}
          className={`graph-category-select w-full p-2 border rounded-lg ${
            // Added class for tutorial target
            isDarkMode
              ? "bg-gray-900 text-white border-gray-600"
              : "bg-gray-100 text-black border-gray-300"
          }`}
        >
          <option value="">{t.selectSectionPrompt}</option>
          {Object.keys(dataCategories).map((section) => (
            <option key={section} value={section}>
              {t[section]}
            </option>
          ))}
        </select>
      </div>

      {selectedGraphCategory && (
        <div className="mb-4">
          <label
            className={`block mb-2 font-medium ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {t.selectIndicator}
          </label>
          <select
            value={selectedGraphIndicator}
            onChange={(e) => setSelectedGraphIndicator(e.target.value)}
            className={`graph-indicator-select w-full p-2 border rounded-lg ${
              // Added class for tutorial target
              isDarkMode
                ? "bg-gray-900 text-white border-gray-600"
                : "bg-gray-100 text-black border-gray-300"
            }`}
          >
            <option value="">{t.selectIndicatorPrompt}</option>
            {dataCategories[
              selectedGraphCategory as keyof typeof dataCategories
            ]?.map((indicator) => (
              <option key={indicator} value={indicator}>
                {t[indicator as keyof typeof t]}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedGraphIndicator && (
        <div
          className={`graph-commune-list mb-4 border rounded-lg p-2 relative flex flex-col transition-all duration-500 ease-in-out`} // Added class for tutorial target
        >
          <div className="flex justify-between items-center mb-2">
            <label
              className={`block font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.selectCommunes}
            </label>
            <button
              onClick={() => setIsCommuneListExpanded(!isCommuneListExpanded)}
              className={`p-1 rounded-full ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label={
                isCommuneListExpanded
                  ? "Réduire la liste des communes"
                  : "Agrandir la liste des communes"
              }
            >
              {isCommuneListExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
          <div
            className={`overflow-y-auto ${communeListHeightClass} transition-[max-height] duration-500 ease-in-out ${
              // Use transition-[max-height] for explicit transition
              isDarkMode ? "scrollbar-dark" : "scrollbar-light"
            }`}
          >
            {polygons
              .filter((p) => p.layer === "commune")
              .map((commune) => (
                <div key={commune.name} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={selectedCommunes.includes(commune.name)}
                    onChange={() => handleCommuneToggle(commune.name)}
                    className="mr-2"
                  />
                  <label
                    className={`${isDarkMode ? "text-white" : "text-black"}`}
                  >
                    {t[commune.name]}
                  </label>
                </div>
              ))}
          </div>
          {selectedCommunes.length > 0 && (
            <button
              onClick={() => setSelectedCommunes([])}
              className={`mt-2 px-3 py-1 rounded-md text-sm ${
                isDarkMode
                  ? "bg-red-700 hover:bg-red-800 text-white"
                  : "bg-red-400 hover:bg-red-500 text-white"
              }`}
            >
              {t.clearSelection}
            </button>
          )}
        </div>
      )}

      {selectedGraphIndicator && selectedCommunes.length > 0 && (
        <div
          ref={chartContainerRef}
          className={`graph-chart-display mt-4 border rounded-lg p-2 relative flex flex-col ${
            // Added class for tutorial target
            isChartExpanded ? "flex-1" : ""
          } overflow-hidden`}
        >
          <div className="flex justify-between items-center mb-2">
            <h4
              className={`font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.chartDisplay}
            </h4>
            <button
              onClick={() => setIsChartExpanded(!isChartExpanded)}
              className={`p-1 rounded-full ${
                isDarkMode
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
              aria-label={
                isChartExpanded
                  ? "Réduire le graphique"
                  : "Agrandir le graphique"
              }
            >
              {isChartExpanded ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
          </div>
          <div
            className={`relative ${
              isChartExpanded ? "h-[500px]" : "h-64"
            } transition-all duration-500 ease-in-out`}
          >
            <canvas ref={chartRef} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphPage;
