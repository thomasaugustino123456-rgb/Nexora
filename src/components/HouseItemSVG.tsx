import React from 'react';
import { motion } from 'framer-motion';

interface HouseItemSVGProps {
  itemId: string;
  lightOn?: boolean;
  plantShaking?: boolean;
  shakePlant?: () => void;
  toggleLight?: () => void;
  room2Lamps?: boolean[];
  toggleRoom2Lamp?: (index: number) => void;
  room2ComputerOn?: boolean;
  toggleRoom2Computer?: () => void;
  room2LaptopOn?: boolean;
  toggleRoom2Laptop?: () => void;
  fireTaps?: number;
  handleFireClick?: () => void;
  isNightMode?: boolean;
}

export const HouseItemSVG: React.FC<HouseItemSVGProps> = ({
  itemId,
  lightOn,
  plantShaking,
  shakePlant,
  toggleLight,
  room2Lamps,
  toggleRoom2Lamp,
  room2ComputerOn,
  toggleRoom2Computer,
  room2LaptopOn,
  toggleRoom2Laptop,
  fireTaps,
  handleFireClick,
  isNightMode
}) => {
  switch (itemId) {
    // Room 0 Items
    case 'h0-picture':
      return (
        <g transform="translate(-260, -140)">
          <polygon points="300,160 220,200 220,120 300,80" fill="#111111" />
          <polygon points="290,155 230,185 230,125 290,95" fill="#F5F5F5" />
          <polygon points="230,185 250,165 260,175 290,140 290,155 230,185" fill="#4CAF50" />
          <ellipse cx="265" cy="115" rx="10" ry="12" transform="rotate(-20 265 115)" fill="#FF9800" />
        </g>
      );
    case 'h0-table':
      return (
        <g transform="translate(-400, -450)">
          <polygon points="310,425 320,430 320,490 310,485" fill="#4E342E" />
          <polygon points="320,430 325,427 325,487 320,490" fill="#3E2723" />
          <polygon points="480,420 490,425 490,485 480,480" fill="#4E342E" />
          <polygon points="490,425 495,422 495,482 490,485" fill="#3E2723" />
          <polygon points="395,475 405,480 405,540 395,535" fill="#4E342E" />
          <polygon points="405,480 410,477 410,537 405,540" fill="#3E2723" />
          <polygon points="400,370 300,420 400,470 500,420" fill="#8D6E63" />
          <polygon points="300,420 400,470 400,480 300,430" fill="#6D4C41" />
          <polygon points="400,470 500,420 500,430 400,480" fill="#5D4037" />
        </g>
      );
    case 'h0-laptop':
      return (
        <g transform="translate(-380, -410)">
          <polygon points="380,410 350,425 380,440 410,425" fill="#BDBDBD" />
          <polygon points="350,425 380,410 380,385 350,400" fill="#9E9E9E" />
          <polygon points="353,421 377,409 377,388 353,403" fill={lightOn ? "#E3F2FD" : "#1a2a3a"} className="transition-colors duration-500" />
        </g>
      );
    case 'h0-chair':
      return (
        <g transform="translate(-470, -450)">
          <polygon points="500,455 505,457 505,502 500,500" fill="#424242" />
          <polygon points="470,475 475,477 475,522 470,520" fill="#616161" />
          <polygon points="435,458 440,460 440,505 435,503" fill="#757575" />
          <polygon points="470,435 430,455 470,475 510,455" fill="#FF7043" />
          <polygon points="430,455 470,475 470,480 430,460" fill="#F4511E" />
          <polygon points="470,475 510,455 510,460 470,480" fill="#E64A19" />
          <polygon points="470,435 510,455 510,395 470,375" fill="#FF8A65" />
          <polygon points="510,455 515,457 515,397 510,395" fill="#E64A19" />
          <polygon points="470,375 510,395 515,397 475,377" fill="#FFAB91" />
        </g>
      );
    case 'h0-plant':
      return (
        <g transform="translate(-350, -335)" onClick={shakePlant}>
          <g id="pot">
            <polygon points="350,315 330,325 350,335 370,325" fill="#5D4037" />
            <polygon points="330,325 350,335 345,365 335,355" fill="#4E342E" />
            <polygon points="350,335 370,325 365,355 345,365" fill="#3E2723" />
          </g>
          <motion.g id="leaves" animate={plantShaking ? { rotate: [0, -4, 12, -8, 4, -2, 0], scaleY: [1, 0.9, 1.12, 0.95, 1.02, 0.99, 1], scaleX: [1, 1.08, 0.9, 1.04, 0.98, 1.01, 1] } : {}} transition={{ duration: 0.9, ease: "easeInOut" }} style={{ transformOrigin: "350px 335px" }}>
            <polygon points="350,325 315,260 335,295" fill="#4CAF50" />
            <polygon points="350,325 350,240 365,285" fill="#2E7D32" />
            <polygon points="350,325 385,270 375,305" fill="#388E3C" />
            <polygon points="350,325 305,290 330,315" fill="#81C784" />
            <polygon points="350,325 385,305 365,320" fill="#A5D6A7" />
          </motion.g>
        </g>
      );
    case 'h0-lamp':
      return (
        <g transform="translate(-400, -160)">
          <line x1="400" y1="-10" x2="400" y2="160" stroke="#111" strokeWidth="3" />
          <motion.g id="lamp" onClick={toggleLight} className="cursor-pointer" animate={{ rotate: lightOn ? 0 : [0, 2, -2, 1, -1, 0] }} transition={{ duration: 0.5 }} style={{ transformOrigin: "400px 160px" }}>
            <polygon points="390,160 410,160 415,165 385,165" fill="#424242" />
            <polygon points="385,165 415,165 440,210 360,210" fill="#212121" />
            <polygon points="400,200 440,210 400,220 360,210" fill={lightOn ? "#FBC02D" : "#333"} className="transition-colors duration-500" />
          </motion.g>
        </g>
      );

    // Room 1 Items
    case 'h1-window':
      return (
        <g transform="translate(-10, -85)">
          <rect x="-30" y="20" width="80" height="120" fill="#E1F5FE"/>
          <path d="M0,0 Q30,50 10,150 L-30,150 V0 Z" fill="#F48FB1"/>
        </g>
      );
    case 'h1-shelves':
      return (
        <g transform="translate(-360, -80)">
          <rect x="330" y="40" width="60" height="8" fill="#8D6E63"/>
          <rect x="330" y="80" width="60" height="8" fill="#8D6E63"/>
          <rect x="340" y="40" width="5" height="48" fill="#795548"/>
          <rect x="335" y="15" width="8" height="25" fill="#D32F2F" rx="1"/>
          <rect x="345" y="12" width="6" height="28" fill="#FBC02D" rx="1"/>
          <rect x="355" y="60" width="10" height="20" fill="#1976D2" rx="1"/>
          <rect x="368" y="58" width="12" height="22" fill="#388E3C" rx="1"/>
        </g>
      );
    case 'h1-dresser':
      return (
        <g transform="translate(-40, -180)">
          <rect x="10" y="150" width="60" height="80" fill="#FFCA28" rx="3"/>
          <rect x="15" y="155" width="50" height="20" fill="#FFB300" rx="2"/>
          <rect x="15" y="180" width="50" height="20" fill="#FFB300" rx="2"/>
          <rect x="15" y="205" width="50" height="20" fill="#FFB300" rx="2"/>
          <rect x="30" y="135" width="20" height="15" fill="#FFFFFF"/>
          <path d="M40,135 Q30,110 25,125 Q40,135 45,115 Q50,135 55,120 Q40,135 40,135" fill="#4CAF50"/>
        </g>
      );
    case 'h1-vanity':
      return (
        <g transform="translate(-110, -160)">
          <rect x="85" y="150" width="50" height="40" fill="#FFCA28" rx="2"/>
          <ellipse cx="110" cy="110" rx="20" ry="35" fill="#B3E5FC" stroke="#FFA000" strokeWidth="4"/>
          <rect x="100" y="195" width="20" height="25" fill="#FFCA28"/>
          <ellipse cx="110" cy="195" rx="15" ry="8" fill="#EC407A"/>
        </g>
      );
    case 'h1-sofa':
      return (
        <g transform="translate(-260, -180)">
          <rect x="170" y="140" width="180" height="70" fill="#F5F5F5" rx="10"/>
          <rect x="160" y="180" width="200" height="35" fill="#FFFFFF" rx="8"/>
          <rect x="180" y="215" width="8" height="10" fill="#FFA000" rx="2"/>
          <rect x="330" y="215" width="8" height="10" fill="#FFA000" rx="2"/>
          <rect x="188" y="162" width="24" height="16" fill="#FBC02D" rx="3" transform="rotate(-10 200 170)"/>
          <circle cx="230" cy="175" r="10" fill="#E91E63"/>
          <rect x="280" y="162" width="20" height="20" fill="#F57C00" rx="3"/>
          <rect x="308" y="167" width="24" height="16" fill="#FBC02D" rx="3" transform="rotate(15 320 175)"/>
        </g>
      );
    case 'h1-bed':
      return (
        <g transform="translate(-140, -170)">
          <rect x="60" y="160" width="160" height="30" fill="#8D6E63" rx="4"/>
          <rect x="70" y="150" width="150" height="35" fill="#4CAF50" rx="5"/>
          <rect x="70" y="165" width="150" height="25" fill="#388E3C" rx="5"/>
          <rect x="50" y="140" width="40" height="20" fill="#FFB74D" rx="5" transform="rotate(-15 70 150)"/>
          <polygon points="140,150 160,155 180,150 180,140 160,145 140,140" fill="#FFFFFF"/>
        </g>
      );
    case 'h1-bookshelf':
      return (
        <g transform="translate(-330, -100)">
          <rect x="300" y="20" width="60" height="170" fill="#FFB300"/>
          <rect x="305" y="25" width="50" height="160" fill="#6D4C41"/>
          <rect x="305" y="60" width="50" height="4" fill="#FFB300"/>
          <rect x="305" y="100" width="50" height="4" fill="#FFB300"/>
          <rect x="305" y="140" width="50" height="4" fill="#FFB300"/>
          <rect x="310" y="35" width="8" height="25" fill="#D32F2F" rx="1"/>
          <rect x="325" y="32" width="6" height="28" fill="#FBC02D" rx="1"/>
          <rect x="340" y="80" width="10" height="20" fill="#1976D2" rx="1"/>
          <rect x="315" y="78" width="12" height="22" fill="#388E3C" rx="1"/>
          <circle cx="330" cy="125" r="12" fill="#29B6F6"/>
          <path d="M330,113 Q345,125 330,137" fill="none" stroke="#4CAF50" strokeWidth="3"/>
          <rect x="328" y="137" width="4" height="4" fill="#BDBDBD"/>
        </g>
      );
    case 'h1-desk':
      return (
        <g transform="translate(-370, -200)">
          <polygon points="340,170 400,190 400,230 340,200" fill="#8D6E63"/>
          <rect x="360" y="200" width="30" height="40" fill="#5D4037"/>
          <g onClick={toggleRoom2Laptop} className="cursor-pointer">
            <polygon points="360,170 380,180 375,160 355,150" fill="#424242"/>
            <polygon points="360,170 380,180 390,175 370,165" fill={room2LaptopOn ? "#E3F2FD" : "#BDBDBD"} className="transition-colors duration-300"/>
          </g>
        </g>
      );
    case 'h1-chair':
      return (
        <g transform="translate(-305, -180)">
          <rect x="290" y="140" width="30" height="35" fill="#EC407A" rx="8"/>
          <ellipse cx="305" cy="185" rx="20" ry="8" fill="#D81B60"/>
          <rect x="303" y="188" width="4" height="20" fill="#424242"/>
          <path d="M290,210 L320,210 M305,210 L305,215" stroke="#424242" strokeWidth="3"/>
        </g>
      );

    // Room 2 Items
    case 'h2-fireplace':
      return (
        <g transform="translate(-400, -300)" onClick={handleFireClick}>
          <rect x="330" y="240" width="140" height="110" fill="#E64A19" /> 
          <rect x="345" y="260" width="110" height="90" fill="#212121" /> 
          <motion.g 
            animate={{ 
              opacity: fireTaps === 4 ? 0.1 : [0.8, 0.95, 0.8],
              scale: fireTaps === 2 || fireTaps === 3 ? 1.6 : fireTaps === 4 ? 0.5 : [0.95, 1, 0.95],
              filter: fireTaps === 2 || fireTaps === 3 ? "brightness(1.4) saturate(1.5)" : fireTaps === 4 ? "grayscale(1) brightness(0.2)" : "none"
            }} 
            transition={{ duration: 0.5 }}
            style={{ transformOrigin: "400px 315px" }}
          >
            <path d="M 380,330 Q 390,280 400,320 Q 410,270 420,330 Z" fill="#FFC107" />
          </motion.g>
        </g>
      );
    case 'h2-chair-left':
      return (
        <g transform="translate(-240, -400)">
          <rect x="210" y="420" width="6" height="40" fill="#8D6E63" /> 
          <rect x="270" y="420" width="6" height="40" fill="#8D6E63" /> 
          <rect x="190" y="440" width="8" height="30" fill="#6D4C41" /> 
          <rect x="280" y="440" width="8" height="30" fill="#6D4C41" /> 
          <polygon points="190,440 288,440 276,425 210,425" fill="#A1887F" /> 
          <polygon points="195,435 280,435 265,420 215,420" fill="#B3E5FC" />
          <polygon points="215,420 265,420 260,360 220,360" fill="#81D4FA" />
        </g>
      );
    case 'h2-chair-right':
      return (
        <g transform="translate(-560, -400)">
          <rect x="530" y="420" width="6" height="40" fill="#8D6E63" /> 
          <rect x="590" y="420" width="6" height="40" fill="#8D6E63" /> 
          <rect x="510" y="440" width="8" height="30" fill="#6D4C41" /> 
          <rect x="600" y="440" width="8" height="30" fill="#6D4C41" /> 
          <polygon points="510,440 608,440 596,425 530,425" fill="#A1887F" /> 
          <polygon points="515,435 600,435 585,420 535,420" fill="#B3E5FC" />
          <polygon points="535,420 585,420 580,360 540,360" fill="#81D4FA" />
        </g>
      );
    case 'h2-coffee-table':
      return (
        <g transform="translate(-410, -510)">
          <rect x="345" y="480" width="10" height="65" fill="#8D6E63" rx="2" />
          <rect x="465" y="480" width="10" height="65" fill="#8D6E63" rx="2" />
          <rect x="315" y="520" width="12" height="75" fill="#5D4037" rx="2" />
          <rect x="495" y="520" width="12" height="75" fill="#5D4037" rx="2" />
          <polygon points="300,530 525,530 490,480 330,480" fill="#FFFFFF" />
          <rect x="420" y="495" width="12" height="12" fill="#F5F5F5" rx="1" />
        </g>
      );
    case 'h2-side-table':
      return (
        <g transform="translate(-400, -430)">
          <rect x="375" y="420" width="6" height="35" fill="#5D4037" />
          <rect x="420" y="420" width="6" height="35" fill="#5D4037" />
          <rect x="360" y="415" width="80" height="8" fill="#8D6E63" rx="2" />
        </g>
      );
    case 'h2-shelf':
      return (
        <g transform="translate(-90, -250)">
          <polygon points="30,90 110,140 110,330 30,420" fill="#9E9E9E" />
          <polygon points="70,90 150,140 110,140 30,90" fill="#757575" />
          <polygon points="70,420 150,330 110,330 30,420" fill="#E0E0E0" />
          <polygon points="150,140 150,330 110,330 110,140" fill="#616161" />
        </g>
      );
    case 'h2-lamp':
      return (
        <g transform="translate(-637, -240)" onClick={toggleLight}>
          <rect x="630" y="260" width="15" height="30" fill="#FBC02D" rx="5" /> 
          <polygon points="637,210 660,265 615,265" fill="#FFF59D" /> 
        </g>
      );

    default:
      return null;
  }
};
