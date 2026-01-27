import { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export interface Section {
  id: string;
  name: string;
  type: 'floor' | 'lower' | 'upper' | 'suite' | 'stage' | 'pit';
  available: number;
  priceFrom: number;
}

// Extract sections from the SVG
export const pinnacleSections: Section[] = [
  // Floor sections
  { id: 'a', name: 'A', type: 'floor', available: 8, priceFrom: 280 },
  { id: 'b', name: 'B', type: 'floor', available: 15, priceFrom: 260 },
  { id: 'c', name: 'C', type: 'floor', available: 10, priceFrom: 240 },
  { id: 'd', name: 'D', type: 'floor', available: 6, priceFrom: 270 },
  { id: 'f', name: 'F', type: 'floor', available: 9, priceFrom: 230 },
  
  // Lower level (100s)
  { id: '101', name: '101', type: 'lower', available: 18, priceFrom: 165 },
  { id: '102', name: '102', type: 'lower', available: 22, priceFrom: 165 },
  { id: '103', name: '103', type: 'lower', available: 31, priceFrom: 145 },
  { id: '104', name: '104', type: 'lower', available: 22, priceFrom: 145 },
  { id: '105', name: '105', type: 'lower', available: 28, priceFrom: 135 },
  { id: '106', name: '106', type: 'lower', available: 35, priceFrom: 135 },
  { id: '107', name: '107', type: 'lower', available: 42, priceFrom: 125 },
  { id: '108', name: '108', type: 'lower', available: 38, priceFrom: 125 },
  { id: '109', name: '109', type: 'lower', available: 29, priceFrom: 135 },
  { id: '110', name: '110', type: 'lower', available: 21, priceFrom: 145 },
  { id: '111', name: '111', type: 'lower', available: 33, priceFrom: 145 },
  { id: '112', name: '112', type: 'lower', available: 26, priceFrom: 155 },
  { id: '113', name: '113', type: 'lower', available: 19, priceFrom: 165 },
  { id: '114', name: '114', type: 'lower', available: 27, priceFrom: 165 },
  { id: '115', name: '115', type: 'lower', available: 32, priceFrom: 155 },
  { id: '116', name: '116', type: 'lower', available: 25, priceFrom: 145 },
  { id: '117', name: '117', type: 'lower', available: 40, priceFrom: 135 },
  { id: '118', name: '118', type: 'lower', available: 36, priceFrom: 135 },
  { id: '119', name: '119', type: 'lower', available: 28, priceFrom: 145 },
  { id: '120', name: '120', type: 'lower', available: 23, priceFrom: 155 },
  { id: '121', name: '121', type: 'lower', available: 17, priceFrom: 165 },
  { id: '122', name: '122', type: 'lower', available: 14, priceFrom: 175 },
  
  // Upper level (200s)
  { id: '201', name: '201', type: 'upper', available: 45, priceFrom: 95 },
  { id: '202', name: '202', type: 'upper', available: 52, priceFrom: 90 },
  { id: '203', name: '203', type: 'upper', available: 48, priceFrom: 85 },
  { id: '204', name: '204', type: 'upper', available: 55, priceFrom: 80 },
  { id: '205', name: '205', type: 'upper', available: 61, priceFrom: 75 },
  { id: '206', name: '206', type: 'upper', available: 58, priceFrom: 70 },
  { id: '207', name: '207', type: 'upper', available: 64, priceFrom: 65 },
  { id: '208', name: '208', type: 'upper', available: 56, priceFrom: 70 },
  { id: '209', name: '209', type: 'upper', available: 49, priceFrom: 75 },
  { id: '210', name: '210', type: 'upper', available: 43, priceFrom: 80 },
  { id: '211', name: '211', type: 'upper', available: 38, priceFrom: 85 },
  { id: '212', name: '212', type: 'upper', available: 41, priceFrom: 90 },
  { id: '213', name: '213', type: 'upper', available: 35, priceFrom: 95 },
  { id: '214', name: '214', type: 'upper', available: 37, priceFrom: 95 },
  { id: '215', name: '215', type: 'upper', available: 42, priceFrom: 90 },
  { id: '216', name: '216', type: 'upper', available: 39, priceFrom: 85 },
  { id: '217', name: '217', type: 'upper', available: 46, priceFrom: 80 },
  { id: '218', name: '218', type: 'upper', available: 51, priceFrom: 75 },
  { id: '219', name: '219', type: 'upper', available: 57, priceFrom: 70 },
  { id: '220', name: '220', type: 'upper', available: 62, priceFrom: 65 },
  { id: '221', name: '221', type: 'upper', available: 54, priceFrom: 70 },
  { id: '222', name: '222', type: 'upper', available: 47, priceFrom: 75 },
];

interface PinnacleBankArenaMapProps {
  onSectionHover: (section: Section | null) => void;
  onSectionClick: (sectionId: string) => void;
  selectedSection: string | null;
}

export const PinnacleBankArenaMap = ({ onSectionHover, onSectionClick, selectedSection }: PinnacleBankArenaMapProps) => {
  const [scale, setScale] = useState(1);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5));
  const handleReset = () => setScale(1);

  const getSectionColor = (sectionId: string) => {
    const section = pinnacleSections.find(s => s.id === sectionId);
    if (!section) return '#999999';
    
    const isHovered = hoveredSection === sectionId;
    const isSelected = selectedSection === sectionId;
    
    if (section.type === 'floor') {
      if (isSelected) return '#4ade80';
      if (isHovered) return '#6ee7b7';
      return '#22c55e';
    }
    
    // Lower and upper - cyan
    if (isSelected) return '#67e8f9';
    if (isHovered) return '#5eead4';
    return '#22d3ee';
  };

  const handleMouseEnter = (sectionId: string) => {
    const section = pinnacleSections.find(s => s.id === sectionId);
    if (section) {
      setHoveredSection(sectionId);
      onSectionHover(section);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
    onSectionHover(null);
  };

  const handleClick = (sectionId: string) => {
    const section = pinnacleSections.find(s => s.id === sectionId);
    if (section) {
      onSectionClick(sectionId);
    }
  };

  // Common props for interactive sections
  const sectionProps = (id: string) => ({
    style: { 
      fill: getSectionColor(id), 
      stroke: '#666666',
      cursor: 'pointer',
      transition: 'fill 0.15s ease'
    },
    onMouseEnter: () => handleMouseEnter(id),
    onMouseLeave: handleMouseLeave,
    onClick: () => handleClick(id),
  });

  return (
    <div className="relative bg-[#e2e8f0] rounded-xl border border-border overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Plus size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Minus size={16} className="text-gray-700" />
        </button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RotateCcw size={16} className="text-gray-700" />
        </button>
      </div>

      {/* SVG Map from GoTickets - Pinnacle Bank Arena */}
      <div className="overflow-hidden p-2">
        <svg
          xmlSpace="preserve"
          viewBox="0 0 2883.83 3017.3661"
          className="w-full h-auto transition-transform duration-200"
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'center',
            clipRule: 'evenodd',
            fillRule: 'evenodd',
            shapeRendering: 'geometricPrecision',
            textRendering: 'geometricPrecision'
          }}
        >
          <defs>
            <style>{`
              .str0 {stroke:#373435;stroke-width:3;stroke-miterlimit:2.61313}
              .fil2 {fill:none}
              .fil3 {fill:#D2D3D5}
              .fil0 {fill:#848688}
              .fil1 {fill:black}
              .fnt3 {font-weight:normal;font-size:27.78px;font-family:'Arial'}
              .fnt2 {font-weight:normal;font-size:34.72px;font-family:'Arial'}
              .fnt1 {font-weight:normal;font-size:62.5px;font-family:'Arial'}
              .fnt0 {font-weight:normal;font-size:62.87px;font-family:'Arial'}
              .section-label{fill:#000000;font-family:'Arial';pointer-events:none}
              .static{fill:#999999; stroke:black;stroke-width:2}
            `}</style>
          </defs>

          <g id="parent-group" transform="translate(15.397775,7.3801572)">
            {/* Static elements - Stage, Mix, outline */}
            <g id="static-elements">
              {/* Stage platform */}
              <path className="fil0 str0" d="m 1289.2479,1443.7738 h 208.5241 v 116.0094 h -208.5241 z" style={{ fill: '#666666', stroke: '#666666' }} />
              <path className="fil0 str0" d="m 2192.9092,1317.1354 v 340.1093 h 250.1314 v -170.0122 -170.0971 z" style={{ fill: '#666666', stroke: '#666666' }} />
              
              {/* Stage and Mix labels */}
              <g transform="rotate(90,1919.4771,1886.1029)">
                <text className="fil1 fnt0" x="-1575.329" y="1539.5547" transform="rotate(-90)" style={{ fontSize: '53px', fontFamily: 'Arial', fill: '#000' }}>STAGE</text>
                <text className="fil1 fnt0" x="-2461.0359" y="1554.1431" transform="rotate(-90)" style={{ fontSize: '53px', fontFamily: 'Arial', fill: '#000' }}>MIX</text>
              </g>
              
              {/* Arena outline */}
              <path className="fil2 str0" d="m 2526.37,2157.18 c 109.49,187.42 218.98,374.85 328.46,562.27 L 2383.7,2995.01 H 1026.03 L 368.78,2610.01 5.16,1967.06 V 1016.35 L 383.94,382.2 1032.98,5.01 h 1352.69 c 151.76,88.7 303.53,177.4 455.3,266.1 -105.88,189.91 -212.32,378.95 -317.02,568.96 l 25.43,14.87 206.59,340.41 v 602.71 l -199.7,341.63 -29.91,17.5 z" style={{ stroke: '#000', strokeWidth: 7, fill: 'none' }} />
            </g>

            {/* Interactive Sections */}
            <g id="sections">
              {/* Floor Sections */}
              <g id="c-group" data-section-id="c">
                <path d="m 1529.7711,1590.7982 h 275.4917 v 77.3949 49.2768 l -275.4917,0.2127 v -43.2473 z" {...sectionProps('c')} />
                <text className="section-label" x="1648" y="1673" fontSize="53px" fontWeight="normal" textAnchor="middle">C</text>
              </g>
              
              <g id="b-group" data-section-id="b">
                <path d="m 1528.9814,1581.2749 0.3717,-159.7726 c 71.6351,-0.3946 204.9922,-0.5592 276.6242,3e-4 l -0.5155,159.7797 z" {...sectionProps('b')} />
                <text className="section-label" x="1649" y="1520" fontSize="53px" fontWeight="normal" textAnchor="middle">B</text>
              </g>
              
              <g id="a-group" data-section-id="a">
                <path d="m 1806.16,1289.2279 v 122.2487 h -278.5641 v -122.9771 z" {...sectionProps('a')} />
                <text className="section-label" x="1649" y="1369" fontSize="53px" fontWeight="normal" textAnchor="middle">A</text>
              </g>
              
              <g id="f-group" data-section-id="f">
                <path d="m 1343.5864,1717.1708 h 170.9498 v -61.37 l -0.2302,-64.9105 h -171.2267 z" {...sectionProps('f')} />
                <text className="section-label" x="1412" y="1673" fontSize="53px" fontWeight="normal" textAnchor="middle">F</text>
              </g>
              
              <g id="d-group" data-section-id="d">
                <path d="m 1342.8901,1411.4739 h 171.3275 v -122.9767 h -171.7651 c -0.1504,4.4243 0.4376,122.9767 0.4376,122.9767 z" {...sectionProps('d')} />
                <text className="section-label" x="1409" y="1369" fontSize="53px" fontWeight="normal" textAnchor="middle">D</text>
              </g>

              {/* Lower Level 100s */}
              <g id="101-group">
                <path d="M 2607.59,1375.4767 V 1616.69 H 2506.9 v -241.2133 z" {...sectionProps('101')} />
                <text className="section-label" x="2557" y="1513" fontSize="47px" textAnchor="middle">101</text>
              </g>
              
              <g id="102-group">
                <path d="m 2633.65,1630.2 v 134.72 l -81.99,140.26 -109.21,-64.3 64.46,-110.29 c 0,-33.46 0,-66.93 0,-100.39 z" {...sectionProps('102')} />
                <text className="section-label" x="2540" y="1775" fontSize="47px" textAnchor="middle">102</text>
              </g>
              
              <g id="103-group">
                <path d="m 2544.87,1916.81 -78.02,133.46 -142.19,83.16 c -50.23,-82.87 -100.46,-165.74 -150.7,-248.61 l 80.37,-47.01 72.47,72.46 52.99,-90.65 165.07,97.19 z" {...sectionProps('103')} />
                <text className="section-label" x="2370" y="1999" fontSize="47px" textAnchor="middle">103</text>
              </g>
              
              <g id="104-group">
                <path d="m 2313.04,2140.22 -138.93,81.26 h -65.19 l 3.3,-224.41 -17.85,-65.75 67.97,-39.72 c 50.23,82.87 100.46,165.74 150.69,248.61 z" {...sectionProps('104')} />
                <text className="section-label" x="2170" y="2131" fontSize="47px" textAnchor="middle">104</text>
              </g>
              
              <g id="105-group">
                <path d="m 2095.46,2221.49 h -146.68 c 0,-149.3 0,-298.59 0,-447.89 h 88.13 l 61.83,224.28 -3.29,223.61 z" {...sectionProps('105')} />
                <text className="section-label" x="1995" y="2020" fontSize="47px" textAnchor="middle">105</text>
              </g>
              
              <g id="106-group">
                <path d="M 1935.27,2221.49 H 1712.75 V 1773.6 h 222.52 c 0,149.3 0,298.59 0,447.89 z" {...sectionProps('106')} />
                <text className="section-label" x="1824" y="2020" fontSize="47px" textAnchor="middle">106</text>
              </g>
              
              <g id="107-group">
                <path d="M 1699.23,2221.49 H 1475.29 V 1773.6 h 223.94 c 0,149.3 0,298.59 0,447.89 z" {...sectionProps('107')} />
                <text className="section-label" x="1587" y="2020" fontSize="47px" textAnchor="middle">107</text>
              </g>
              
              <g id="108-group">
                <path d="m 1461.78,2221.49 h -156.82 l -0.85,-222 65.06,-225.88 h 92.62 c 0,149.3 0,298.59 0,447.89 z" {...sectionProps('108')} />
                <text className="section-label" x="1370" y="2020" fontSize="47px" textAnchor="middle">108</text>
              </g>
              
              <g id="109-group">
                <path d="m 1291.5,2221.49 h -55.59 l -135.74,-79.52 c 74.19,-129.56 148.39,-259.12 222.59,-388.69 l 32.69,19.15 -64.57,224.2 z" {...sectionProps('109')} />
                <text className="section-label" x="1190" y="2124" fontSize="47px" textAnchor="middle">109</text>
              </g>
              
              <g id="110-group">
                <path d="m 1088.52,2135.15 -149,-87.28 -81.52,-144.13 251.39,-145.99 44.61,78.88 116,-114.24 41.11,24.08 c -74.2,129.56 -148.39,259.13 -222.59,388.69 z" {...sectionProps('110')} />
                <text className="section-label" x="1020" y="1963" fontSize="47px" textAnchor="middle">110</text>
              </g>
              
              <g id="111-group">
                <path d="m 851.37,1891.99 -72.69,-128.52 v -137.28 h 447.89 v 19.4 l 12.14,21.46 c -129.12,74.98 -258.23,149.96 -387.34,224.94 z" {...sectionProps('111')} />
                <text className="section-label" x="930" y="1734" fontSize="47px" textAnchor="middle">111</text>
              </g>
              
              <g id="112-group">
                <path d="m 778.68,1612.67 v -219.85 h 447.89 v 219.85 c -149.3,0 -298.59,0 -447.89,0 z" {...sectionProps('112')} />
                <text className="section-label" x="1003" y="1516" fontSize="47px" textAnchor="middle">112</text>
              </g>
              
              <g id="113-group">
                <path d="m 778.68,1379.3 v -149.54 l 74.67,-125 384.86,229.08 -11.64,19.5 v 25.96 c -149.3,0 -298.59,0 -447.89,0 z" {...sectionProps('113')} />
                <text className="section-label" x="930" y="1287" fontSize="47px" textAnchor="middle">113</text>
              </g>
              
              <g id="114-group">
                <path d="m 945.48,950.5 146.26,-85 218.46,391.07 -39.56,23 -114.12,-115.5 -46.49,77.82 c -83.26,-49.56 -166.52,-99.12 -249.78,-148.68 l 85.24,-142.72 z" {...sectionProps('114')} />
                <text className="section-label" x="1050" y="1074" fontSize="47px" textAnchor="middle">114</text>
              </g>
              
              <g id="115-group">
                <path d="m 1103.39,858.73 138.04,-80.22 h 50.91 v 219.84 l 56.73,235.63 -27.22,15.82 C 1249.03,1119.44 1176.21,989.08 1103.39,858.73 Z" {...sectionProps('115')} />
                <text className="section-label" x="1200" y="914" fontSize="47px" textAnchor="middle">115</text>
              </g>
              
              <g id="116-group">
                <path d="m 1305.85,778.51 h 161.64 v 447.89 h -105.37 l -56.27,-228.76 c 0,-73.04 0,-146.09 0,-219.13 z" {...sectionProps('116')} />
                <text className="section-label" x="1387" y="1025" fontSize="47px" textAnchor="middle">116</text>
              </g>
              
              <g id="117-group">
                <path d="m 1481.01,778.51 h 135.71 v 70.77 h 82.61 l 2.3739,377.62 -220.6839,-0.5 V 778.51 Z" {...sectionProps('117')} />
                <text className="section-label" x="1587" y="1025" fontSize="47px" textAnchor="middle">117</text>
              </g>
              
              <g id="118-group">
                <path d="m 1712.84,849.28 h 80.44 v -70.77 h 142.16 l -0.3255,447.89 H 1712.83 V 849.28 Z" {...sectionProps('118')} />
                <text className="section-label" x="1824" y="1025" fontSize="47px" textAnchor="middle">118</text>
              </g>
              
              <g id="119-group">
                <path d="m 1948.96,778.51 h 156.49 v 220.67 l -72.5069,227.22 H 1948.96 Z" {...sectionProps('119')} />
                <text className="section-label" x="2020" y="1025" fontSize="47px" textAnchor="middle">119</text>
              </g>
              
              <g id="120-group">
                <path d="m 2118.97,778.51 h 57.23 l 134.19,78.43 -141.56,253.95 -69.45,-40.59 19.6,-70.24 c 0,-73.85 0,-147.7 0,-221.56 z" {...sectionProps('120')} />
                <text className="section-label" x="2180" y="918" fontSize="47px" textAnchor="middle">120</text>
              </g>
              
              <g id="121-group">
                <path d="m 2266.5384,963.28783 c -28.6922,51.47367 -57.3848,102.94527 -86.0799,154.41897 l 70.1497,40.9953 71.7164,-72.9167 61.1572,100.769 54.6671,-33.9965 -78.1657,-134.135 z" {...sectionProps('121')} />
                <text className="section-label" x="2260" y="1079" fontSize="47px" textAnchor="middle">121</text>
              </g>
              
              <g id="122-group">
                <path d="m 2553.16,1096.94 80.48,132.61 v 132.4067 H 2506.9 V 1265 l -61.38,-101.15 c 35.88,-22.31 71.76,-44.61 107.63,-66.92 z" {...sectionProps('122')} />
                <text className="section-label" x="2557" y="1271" fontSize="47px" textAnchor="middle">122</text>
              </g>

              {/* Upper Level 200s */}
              <g id="201-group">
                <path d="m 2444.28,2260.12 -139.03,81.32 c 29.1,48.85 58.2,97.7 87.3,146.56 l 136.33,-79.73 -84.59,-148.14 z" {...sectionProps('201')} />
                <text className="section-label" x="2400" y="2396" fontSize="47px" textAnchor="middle">201</text>
              </g>
              
              <g id="202-group">
                <path d="m 2293.62,2348.24 -73.52,43 h -17.98 c 0,56.86 0,113.72 0,170.58 h 64.2 l 114.59,-67.02 z" {...sectionProps('202')} />
                <text className="section-label" x="2260" y="2489" fontSize="47px" textAnchor="middle">202</text>
              </g>
              
              <g id="203-group">
                <path d="m 2189.57,2391.24 h -168.57 v 170.57 h 168.57 c 0,-56.86 0,-113.71 0,-170.57 z" {...sectionProps('203')} />
                <text className="section-label" x="2105" y="2489" fontSize="47px" textAnchor="middle">203</text>
              </g>
              
              <g id="204-group">
                <path d="m 2007.49,2561.81 h -170.57 v -170.57 h 170.57 z" {...sectionProps('204')} />
                <text className="section-label" x="1922" y="2489" fontSize="47px" textAnchor="middle">204</text>
              </g>
              
              <g id="205-group">
                <path d="m 1823.42,2561.81 h -170.57 v -170.57 h 170.57 z" {...sectionProps('205')} />
                <text className="section-label" x="1738" y="2489" fontSize="47px" textAnchor="middle">205</text>
              </g>
              
              <g id="206-group">
                <path d="m 1639.34,2561.81 h -170.57 v -170.57 h 170.57 z" {...sectionProps('206')} />
                <text className="section-label" x="1554" y="2489" fontSize="47px" textAnchor="middle">206</text>
              </g>
              
              <g id="207-group">
                <path d="m 1455.27,2561.81 h -170.57 v -170.57 h 170.57 z" {...sectionProps('207')} />
                <text className="section-label" x="1370" y="2489" fontSize="47px" textAnchor="middle">207</text>
              </g>
              
              <g id="208-group">
                <path d="m 1271.19,2561.81 h -170.57 v -170.57 h 170.57 z" {...sectionProps('208')} />
                <text className="section-label" x="1186" y="2489" fontSize="47px" textAnchor="middle">208</text>
              </g>
              
              <g id="209-group">
                <path d="m 1087.12,2561.81 h -69.97 l -80.14,-46.87 c 0,-41.23 0,-82.47 0,-123.7 h 150.1 c 0,56.86 0.01,113.71 0.01,170.57 z" {...sectionProps('209')} />
                <text className="section-label" x="1002" y="2489" fontSize="47px" textAnchor="middle">209</text>
              </g>
              
              <g id="210-group">
                <path d="m 923.65,2508.18 -146.18,-86.19 83.64,-147.79 146.18,86.19 z" {...sectionProps('210')} />
                <text className="section-label" x="870" y="2367" fontSize="47px" textAnchor="middle">210</text>
              </g>
              
              <g id="211-group">
                <path d="m 764.96,2415.18 -83.53,-49.08 -83.11,-146.31 150.36,-85.34 100.12,133.9 z" {...sectionProps('211')} />
                <text className="section-label" x="714" y="2251" fontSize="47px" textAnchor="middle">211</text>
              </g>
              
              <g id="212-group">
                <path d="m 591.49,2206.38 -73.24,-128.51 -85.34,-25.12 v -170.56 l 246.02,142.63 z" {...sectionProps('212')} />
                <text className="section-label" x="530" y="2055" fontSize="47px" textAnchor="middle">212</text>
              </g>
              
              <g id="213-group">
                <path d="m 432.9,1869.33 v -170.56 h 170.56 v 170.56 z" {...sectionProps('213')} />
                <text className="section-label" x="518" y="1797" fontSize="47px" textAnchor="middle">213</text>
              </g>
              
              <g id="214-group">
                <path d="m 432.9,1685.25 v -170.56 h 170.56 v 170.56 z" {...sectionProps('214')} />
                <text className="section-label" x="518" y="1613" fontSize="47px" textAnchor="middle">214</text>
              </g>
              
              <g id="215-group">
                <path d="m 432.9,1501.18 v -170.56 h 170.56 v 170.56 z" {...sectionProps('215')} />
                <text className="section-label" x="518" y="1429" fontSize="47px" textAnchor="middle">215</text>
              </g>
              
              <g id="216-group">
                <path d="m 432.9,1317.11 v -170.56 h 170.56 v 170.56 z" {...sectionProps('216')} />
                <text className="section-label" x="518" y="1245" fontSize="47px" textAnchor="middle">216</text>
              </g>
              
              <g id="217-group">
                <path d="m 432.9,1133.04 v -170.56 l 246.02,-142.63 v 170.56 z" {...sectionProps('217')} />
                <text className="section-label" x="560" y="996" fontSize="47px" textAnchor="middle">217</text>
              </g>
              
              <g id="218-group">
                <path d="m 692.4,813.06 99.95,-133.8 150.48,85.14 -83.45,147.13 z" {...sectionProps('218')} />
                <text className="section-label" x="795" y="828" fontSize="47px" textAnchor="middle">218</text>
              </g>
              
              <g id="219-group">
                <path d="m 806.37,672.48 83.32,-48.36 80.02,46.81 v 170.56 l -146,-85.29 z" {...sectionProps('219')} />
                <text className="section-label" x="898" y="753" fontSize="47px" textAnchor="middle">219</text>
              </g>
              
              <g id="220-group">
                <path d="m 983.23,670.93 h 69.95 v 170.56 h -69.95 l -0.01,-170.56 z" {...sectionProps('220')} />
                <text className="section-label" x="1018" y="769" fontSize="47px" textAnchor="middle">220</text>
              </g>
              
              <g id="221-group">
                <path d="m 1066.69,670.93 h 170.56 v 170.56 h -170.56 z" {...sectionProps('221')} />
                <text className="section-label" x="1152" y="769" fontSize="47px" textAnchor="middle">221</text>
              </g>
              
              <g id="222-group">
                <path d="m 1250.77,670.93 h 170.56 v 170.56 h -170.56 z" {...sectionProps('222')} />
                <text className="section-label" x="1336" y="769" fontSize="47px" textAnchor="middle">222</text>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* VIP Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-300 shadow-sm">
        <span className="text-amber-500 text-lg">👑</span>
        <span className="font-semibold text-gray-800">VIP</span>
      </div>
    </div>
  );
};
