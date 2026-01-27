import { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

export interface Section {
  id: string;
  name: string;
  type: 'floor' | 'lower' | 'upper' | 'suite' | 'stage' | 'pit';
  available: number;
  priceFrom: number;
}

export const sections: Section[] = [
  // Floor sections
  { id: 'ga-pit', name: 'GA PIT', type: 'pit', available: 12, priceFrom: 350 },
  { id: 'floor-a', name: 'A', type: 'floor', available: 8, priceFrom: 280 },
  { id: 'floor-b', name: 'B', type: 'floor', available: 15, priceFrom: 260 },
  { id: 'floor-c', name: 'C', type: 'floor', available: 10, priceFrom: 240 },
  { id: 'floor-d', name: 'D', type: 'floor', available: 6, priceFrom: 270 },
  { id: 'floor-f', name: 'F', type: 'floor', available: 9, priceFrom: 230 },
  { id: 'mix', name: 'MIX', type: 'floor', available: 4, priceFrom: 200 },
  { id: 'stage', name: 'STAGE', type: 'stage', available: 0, priceFrom: 0 },
  
  // Lower level (100s)
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `${101 + i}`,
    name: `${101 + i}`,
    type: 'lower' as const,
    available: Math.floor(Math.random() * 30) + 10,
    priceFrom: 120 + Math.floor(Math.random() * 60),
  })),
  
  // Upper level (200s)
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `${201 + i}`,
    name: `${201 + i}`,
    type: 'upper' as const,
    available: Math.floor(Math.random() * 50) + 20,
    priceFrom: 80 + Math.floor(Math.random() * 40),
  })),
  
  // Upper concourse (300s)
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `${301 + i}`,
    name: `${301 + i}`,
    type: 'upper' as const,
    available: Math.floor(Math.random() * 60) + 30,
    priceFrom: 50 + Math.floor(Math.random() * 30),
  })),
];

interface VenueMapProps {
  onSectionHover: (section: Section | null) => void;
  onSectionClick: (sectionId: string) => void;
  selectedSection: string | null;
}

export const VenueMap = ({ onSectionHover, onSectionClick, selectedSection }: VenueMapProps) => {
  const [scale, setScale] = useState(1);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5));
  const handleReset = () => setScale(1);

  const getSectionColor = (sectionId: string, isHovered: boolean, isSelected: boolean) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return '#475569';
    
    if (section.type === 'stage') return '#475569';
    if (section.type === 'pit' || section.type === 'floor') {
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
    const section = sections.find(s => s.id === sectionId);
    if (section && section.type !== 'stage') {
      setHoveredSection(sectionId);
      onSectionHover(section);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
    onSectionHover(null);
  };

  const handleClick = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section && section.type !== 'stage') {
      onSectionClick(sectionId);
    }
  };

  // Common props for interactive sections
  const sectionProps = (id: string) => ({
    fill: getSectionColor(id, hoveredSection === id, selectedSection === id),
    stroke: '#0d1117',
    strokeWidth: 1,
    className: 'cursor-pointer transition-all duration-150 hover:brightness-110',
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

      {/* SVG Map - Accurate Capital One Arena Layout */}
      <div className="overflow-hidden p-2">
        <svg
          viewBox="0 0 700 650"
          className="w-full h-auto transition-transform duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          {/* 300 Level - Outer Ring (Upper Concourse) */}
          {/* Top sections */}
          <polygon points="195,35 235,30 245,65 205,70" {...sectionProps('317')}>
            <title>Section 317</title>
          </polygon>
          <text x="220" y="50" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">317</text>
          
          <polygon points="250,28 320,22 322,58 255,62" {...sectionProps('318')}>
            <title>Section 318</title>
          </polygon>
          <text x="286" y="42" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">318</text>
          
          <polygon points="335,22 405,28 400,65 340,58" {...sectionProps('319')}>
            <title>Section 319</title>
          </polygon>
          <text x="370" y="44" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">319</text>
          
          <polygon points="420,32 465,45 455,82 410,68" {...sectionProps('320')}>
            <title>Section 320</title>
          </polygon>
          <text x="438" y="58" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">320</text>
          
          <polygon points="478,52 520,78 502,112 465,88" {...sectionProps('321')}>
            <title>Section 321</title>
          </polygon>
          <text x="492" y="85" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">321</text>
          
          <polygon points="532,90 568,128 545,162 512,125" {...sectionProps('322')}>
            <title>Section 322</title>
          </polygon>
          <text x="540" y="128" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">322</text>
          
          {/* Right side sections */}
          <polygon points="578,145 605,192 578,222 555,178" {...sectionProps('301')}>
            <title>Section 301</title>
          </polygon>
          <text x="580" y="185" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">301</text>
          
          <polygon points="612,210 628,265 598,288 585,238" {...sectionProps('302')}>
            <title>Section 302</title>
          </polygon>
          <text x="608" y="252" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">302</text>
          
          <polygon points="632,285 638,345 608,358 605,305" {...sectionProps('303')}>
            <title>Section 303</title>
          </polygon>
          <text x="622" y="322" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">303</text>
          
          <polygon points="640,365 635,425 605,428 610,375" {...sectionProps('304')}>
            <title>Section 304</title>
          </polygon>
          <text x="625" y="398" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">304</text>
          
          <polygon points="632,445 615,502 585,492 598,442" {...sectionProps('305')}>
            <title>Section 305</title>
          </polygon>
          <text x="610" y="470" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">305</text>
          
          <polygon points="608,518 578,568 552,545 578,502" {...sectionProps('306')}>
            <title>Section 306</title>
          </polygon>
          <text x="580" y="535" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">306</text>
          
          {/* Bottom sections */}
          <polygon points="565,578 525,608 505,575 542,552" {...sectionProps('307')}>
            <title>Section 307</title>
          </polygon>
          <text x="535" y="578" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">307</text>
          
          <polygon points="510,615 455,628 448,592 498,582" {...sectionProps('308')}>
            <title>Section 308</title>
          </polygon>
          <text x="478" y="605" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">308</text>
          
          <polygon points="438,630 375,632 375,598 435,595" {...sectionProps('309')}>
            <title>Section 309</title>
          </polygon>
          <text x="405" y="612" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">309</text>
          
          <polygon points="358,632 295,625 302,590 360,598" {...sectionProps('310')}>
            <title>Section 310</title>
          </polygon>
          <text x="328" y="608" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">310</text>
          
          <polygon points="280,622 225,605 238,572 288,588" {...sectionProps('311')}>
            <title>Section 311</title>
          </polygon>
          <text x="258" y="595" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">311</text>
          
          <polygon points="212,598 165,565 188,535 228,565" {...sectionProps('312')}>
            <title>Section 312</title>
          </polygon>
          <text x="198" y="568" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">312</text>
          
          {/* Left side sections */}
          <polygon points="155,552 118,502 148,478 180,525" {...sectionProps('313')}>
            <title>Section 313</title>
          </polygon>
          <text x="152" y="515" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">313</text>
          
          <polygon points="110,488 85,428 118,415 138,470" {...sectionProps('314')}>
            <title>Section 314</title>
          </polygon>
          <text x="112" y="452" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">314</text>
          
          <polygon points="78,410 68,348 102,345 108,402" {...sectionProps('315')}>
            <title>Section 315</title>
          </polygon>
          <text x="90" y="378" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">315</text>
          
          <polygon points="68,332 78,268 112,278 102,335" {...sectionProps('316')}>
            <title>Section 316</title>
          </polygon>
          <text x="92" y="302" fontSize="9" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">316</text>
          
          {/* 200 Level - Middle Ring */}
          {/* Top sections */}
          <polygon points="210,85 250,78 258,110 218,115" {...sectionProps('217')}>
            <title>Section 217</title>
          </polygon>
          <text x="235" y="98" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">217</text>
          
          <polygon points="268,75 338,72 338,105 270,108" {...sectionProps('218')}>
            <title>Section 218</title>
          </polygon>
          <text x="305" y="90" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">218</text>
          
          <polygon points="355,72 425,78 420,112 355,105" {...sectionProps('219')}>
            <title>Section 219</title>
          </polygon>
          <text x="390" y="92" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">219</text>
          
          <polygon points="438,82 478,98 468,132 432,118" {...sectionProps('220')}>
            <title>Section 220</title>
          </polygon>
          <text x="455" y="108" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">220</text>
          
          <polygon points="490,108 522,135 508,168 478,142" {...sectionProps('221')}>
            <title>Section 221</title>
          </polygon>
          <text x="500" y="140" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">221</text>
          
          <polygon points="532,148 558,185 540,218 518,182" {...sectionProps('222')}>
            <title>Section 222</title>
          </polygon>
          <text x="538" y="185" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">222</text>
          
          {/* Right side 200s */}
          <polygon points="568,202 588,248 565,275 548,232" {...sectionProps('201')}>
            <title>Section 201</title>
          </polygon>
          <text x="568" y="240" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">201</text>
          
          <polygon points="592,268 602,325 578,342 570,290" {...sectionProps('202')}>
            <title>Section 202</title>
          </polygon>
          <text x="588" y="308" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">202</text>
          
          {/* Bottom 200s */}
          <polygon points="490,548 435,560 430,528 482,518" {...sectionProps('203')}>
            <title>Section 203</title>
          </polygon>
          <text x="462" y="542" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">203</text>
          
          <polygon points="420,562 358,565 358,532 418,530" {...sectionProps('204')}>
            <title>Section 204</title>
          </polygon>
          <text x="390" y="548" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">204</text>
          
          <polygon points="345,565 282,558 290,525 348,532" {...sectionProps('205')}>
            <title>Section 205</title>
          </polygon>
          <text x="318" y="545" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">205</text>
          
          <polygon points="270,555 218,538 232,508 278,522" {...sectionProps('206')}>
            <title>Section 206</title>
          </polygon>
          <text x="250" y="532" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">206</text>
          
          <polygon points="208,530 168,502 188,475 222,500" {...sectionProps('207')}>
            <title>Section 207</title>
          </polygon>
          <text x="198" y="502" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">207</text>
          
          <polygon points="160,490 132,448 158,425 182,465" {...sectionProps('208')}>
            <title>Section 208</title>
          </polygon>
          <text x="160" y="458" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">208</text>
          
          <polygon points="125,432 108,378 138,368 152,418" {...sectionProps('209')}>
            <title>Section 209</title>
          </polygon>
          <text x="132" y="400" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">209</text>
          
          <polygon points="105,360 102,302 135,298 138,352" {...sectionProps('210')}>
            <title>Section 210</title>
          </polygon>
          <text x="122" y="330" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">210</text>
          
          <polygon points="105,285 118,228 150,242 140,295" {...sectionProps('211')}>
            <title>Section 211</title>
          </polygon>
          <text x="130" y="262" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">211</text>
          
          <polygon points="128,215 152,168 180,188 158,232" {...sectionProps('212')}>
            <title>Section 212</title>
          </polygon>
          <text x="155" y="202" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">212</text>
          
          <polygon points="162,158 195,125 218,152 188,182" {...sectionProps('213')}>
            <title>Section 213</title>
          </polygon>
          <text x="192" y="155" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">213</text>
          
          {/* Left side 200s connecting */}
          <polygon points="128,215 158,180 182,205 155,238" {...sectionProps('214')}>
            <title>Section 214</title>
          </polygon>
          <text x="158" y="212" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">214</text>
          
          <polygon points="138,255 165,218 192,245 168,280" {...sectionProps('215')}>
            <title>Section 215</title>
          </polygon>
          <text x="168" y="250" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">215</text>
          
          <polygon points="148,298 178,260 205,290 180,325" {...sectionProps('216')}>
            <title>Section 216</title>
          </polygon>
          <text x="180" y="295" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">216</text>
          
          {/* 100 Level - Inner Ring (Lower Bowl) */}
          {/* Top right corner */}
          <polygon points="500,175 528,205 510,235 485,208" {...sectionProps('120')}>
            <title>Section 120</title>
          </polygon>
          <text x="508" y="208" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">120</text>
          
          <polygon points="535,225 555,265 535,295 518,258" {...sectionProps('121')}>
            <title>Section 121</title>
          </polygon>
          <text x="538" y="262" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">121</text>
          
          <polygon points="558,285 570,335 548,358 538,312" {...sectionProps('122')}>
            <title>Section 122</title>
          </polygon>
          <text x="555" y="322" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">122</text>
          
          {/* Right side 100s */}
          <polygon points="572,355 578,410 555,422 552,372" {...sectionProps('101')}>
            <title>Section 101</title>
          </polygon>
          <text x="565" y="390" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">101</text>
          
          <polygon points="575,430 565,482 540,488 548,440" {...sectionProps('102')}>
            <title>Section 102</title>
          </polygon>
          <text x="558" y="460" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">102</text>
          
          <polygon points="558,498 538,540 515,535 532,495" {...sectionProps('103')}>
            <title>Section 103</title>
          </polygon>
          <text x="538" y="518" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">103</text>
          
          <polygon points="528,548 495,575 478,552 508,528" {...sectionProps('104')}>
            <title>Section 104</title>
          </polygon>
          <text x="505" y="552" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">104</text>
          
          {/* Bottom 100s */}
          <polygon points="482,580 420,595 418,562 475,550" {...sectionProps('105')}>
            <title>Section 105</title>
          </polygon>
          <text x="450" y="572" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">105</text>
          
          <polygon points="405,598 345,600 345,565 402,565" {...sectionProps('106')}>
            <title>Section 106</title>
          </polygon>
          <text x="375" y="582" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">106</text>
          
          <polygon points="332,600 272,592 280,558 335,565" {...sectionProps('107')}>
            <title>Section 107</title>
          </polygon>
          <text x="305" y="578" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">107</text>
          
          <polygon points="260,588 212,568 228,538 268,555" {...sectionProps('108')}>
            <title>Section 108</title>
          </polygon>
          <text x="242" y="562" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">108</text>
          
          <polygon points="202,558 165,528 188,500 220,530" {...sectionProps('109')}>
            <title>Section 109</title>
          </polygon>
          <text x="195" y="528" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">109</text>
          
          {/* Left side 100s */}
          <polygon points="158,515 135,468 162,450 182,492" {...sectionProps('110')}>
            <title>Section 110</title>
          </polygon>
          <text x="162" y="482" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">110</text>
          
          <polygon points="130,452 118,398 148,388 158,438" {...sectionProps('111')}>
            <title>Section 111</title>
          </polygon>
          <text x="140" y="420" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">111</text>
          
          <polygon points="115,382 115,325 148,322 148,375" {...sectionProps('112')}>
            <title>Section 112</title>
          </polygon>
          <text x="132" y="352" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">112</text>
          
          <polygon points="118,308 132,255 162,268 152,318" {...sectionProps('113')}>
            <title>Section 113</title>
          </polygon>
          <text x="142" y="288" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">113</text>
          
          <polygon points="140,242 168,198 195,222 170,262" {...sectionProps('114')}>
            <title>Section 114</title>
          </polygon>
          <text x="170" y="232" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">114</text>
          
          <polygon points="178,188 215,158 238,188 205,215" {...sectionProps('115')}>
            <title>Section 115</title>
          </polygon>
          <text x="210" y="188" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">115</text>
          
          {/* Top 100s */}
          <polygon points="230,150 285,135 290,168 238,180" {...sectionProps('116')}>
            <title>Section 116</title>
          </polygon>
          <text x="262" y="158" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">116</text>
          
          <polygon points="302,132 362,130 362,165 305,165" {...sectionProps('117')}>
            <title>Section 117</title>
          </polygon>
          <text x="335" y="150" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">117</text>
          
          <polygon points="378,132 438,142 432,178 375,168" {...sectionProps('118')}>
            <title>Section 118</title>
          </polygon>
          <text x="408" y="158" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">118</text>
          
          <polygon points="452,148 492,168 480,202 445,185" {...sectionProps('119')}>
            <title>Section 119</title>
          </polygon>
          <text x="468" y="178" fontSize="8" fontWeight="600" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">119</text>
          
          {/* Floor Sections - Center */}
          <rect x="262" y="235" width="50" height="45" rx="3" {...sectionProps('floor-d')}>
            <title>Section D</title>
          </rect>
          <text x="287" y="260" fontSize="12" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">D</text>
          
          <rect x="325" y="235" width="50" height="45" rx="3" {...sectionProps('floor-a')}>
            <title>Section A</title>
          </rect>
          <text x="350" y="260" fontSize="12" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">A</text>
          
          <rect x="200" y="295" width="50" height="45" rx="3" {...sectionProps('mix')}>
            <title>Section MIX</title>
          </rect>
          <text x="225" y="320" fontSize="10" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">MIX</text>
          
          <rect x="262" y="295" width="50" height="45" rx="3" {...sectionProps('floor-b')}>
            <title>Section B</title>
          </rect>
          <text x="287" y="320" fontSize="12" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">B</text>
          
          <rect x="325" y="295" width="85" height="45" rx="3" {...sectionProps('ga-pit')}>
            <title>GA PIT</title>
          </rect>
          <text x="368" y="315" fontSize="10" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">GA</text>
          <text x="368" y="330" fontSize="10" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">PIT</text>
          
          <rect x="200" y="355" width="50" height="45" rx="3" {...sectionProps('floor-f')}>
            <title>Section F</title>
          </rect>
          <text x="225" y="380" fontSize="12" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">F</text>
          
          <rect x="262" y="355" width="50" height="45" rx="3" {...sectionProps('floor-c')}>
            <title>Section C</title>
          </rect>
          <text x="287" y="380" fontSize="12" fontWeight="700" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">C</text>
          
          {/* Stage */}
          <rect x="425" y="280" width="65" height="80" rx="3" fill="#475569" stroke="#0d1117" strokeWidth="1">
            <title>Stage</title>
          </rect>
          <text x="458" y="325" fontSize="11" fontWeight="700" fill="#e2e8f0" textAnchor="middle" className="pointer-events-none select-none">STAGE</text>
          
          {/* Suite boxes at bottom of lower bowl */}
          {['S12', 'S11', 'S10', 'S9', 'S8', 'S7', 'S6', 'S5', 'S4', 'S3', 'S2', 'S1'].map((suite, idx) => (
            <g key={suite}>
              <rect
                x={185 + idx * 24}
                y={418}
                width={20}
                height={14}
                fill="#94a3b8"
                stroke="#0d1117"
                strokeWidth="0.5"
                rx="2"
              />
              <text x={195 + idx * 24} y={428} fontSize="6" fontWeight="500" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">
                {suite}
              </text>
            </g>
          ))}
          
          {/* Loge boxes on sides */}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={`L${i + 1}`}>
              <rect
                x={158}
                y={260 + i * 18}
                width={18}
                height={14}
                fill="#94a3b8"
                stroke="#0d1117"
                strokeWidth="0.5"
                rx="2"
              />
              <text x={167} y={270 + i * 18} fontSize="5" fontWeight="500" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">
                L{i + 1}
              </text>
            </g>
          ))}
          
          {/* Top suite boxes */}
          {['S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35', 'S36'].map((suite, idx) => (
            <g key={suite}>
              <rect
                x={228 + idx * 20}
                y={115}
                width={16}
                height={12}
                fill="#94a3b8"
                stroke="#0d1117"
                strokeWidth="0.5"
                rx="1"
              />
              <text x={236 + idx * 20} y={124} fontSize="5" fontWeight="500" fill="#0d1117" textAnchor="middle" className="pointer-events-none select-none">
                {suite}
              </text>
            </g>
          ))}
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
