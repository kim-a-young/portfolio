import { HABITICT_IMAGES, HABITICT_THUM } from "./showcaseHabitictAsset";
import { RTC_IMAGES, RTC_THUM } from "./showcaseRtcAsset";
import { MONOPLEX_DETAIL1, MONOPLEX_THUM } from "./showcaseMonoplexAsset";
import { REDCONNECT_IMAGES, REDCONNECT_THUM } from "./showcaseRedconnectAsset";
import { GURUFIN_THUM } from "./showcaseGurufinAsset";

export type ProjectItem = {
  id: number;
  name: string;
  url: string;
  image: string;
  accent: string;
  meta?: string;
  detailImage?: string;
  /** Detail modal image gallery. Overrides detailImage/image when set. */
  detailImages?: string[];
  /** 있으면 상세 본문은 줄바꿈 대신 이 배열로만 나뉨(배포 번들에서도 문단 경계가 고정됨) */
  detailParagraphs?: string[];
  detailDesignTypes?: string;
  detailTools?: string;
  detailDescription?: string;
};

const HERZION_DETAIL_PARAGRAPHS = [
  "음향진동 블루투스 헬스케어 기기 연동 앱 ‘헤르지온’ 구축의 디자인 리드로 참여하여 전체를 디자인했습니다.",
  "비전문가와 중장년층 사용자도 쉽게 사용할 수 있도록 단순하고 직관적인 화면을 구성하고, 사용 목적에 따라 쉽게 선택할 수 있는 흐름으로 UI를 구성하였습니다.",
  "또한 헤르지온만의 아이덴티티를 전달할 수 있도록 캐릭터를 기획 및 디자인하고, 서비스 전반에 일관되게 적용하였습니다.",
  "디바이스와의 연결 경험에서는 인터렉션과 애니메이션을 활용하여 사용자에게 자연스럽고 연결감 있는 경험으로 확장하였습니다.",
] as const;

/** /v2 쇼케이스용 최신 카피·순서·이미지 */
export const SHOWCASE_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: "항공정보포털 UI/UX 개편",
    url: "#",
    image: "/images/pf_airportal_m.png",
    accent: "#0369a1", // 딥 블루
    meta: "공공 · 항공",
    detailImage: "/images/pf_airportal.png",
    detailDesignTypes: "Web, UI/UX, Information Architecture, Design System, Data Visualization",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator",
    detailParagraphs: [
      "항공정보포털 ‘AirPortal’ UI/UX 전면 개편 프로젝트에서 디자인 리드로 참여, 전 과정을 주도하고 전체 화면을 작업했습니다.",
      "한국항공협회 및 유관부서 인터뷰에 참여해 기존 서비스의 문제를 정의하고, 대국민 맞춤형 항공정보 서비스로의 개선 방향을 도출했습니다.",
      "KRDS 기준을 참고하여 메인 구조나 메뉴체계를 재설계하고, 포털 목적에 맞는 정보 구조를 새롭게 구축했습니다.",
      "또한 신뢰감을 줄 수 있는 컬러, 타이포그래피, 컴포넌트 등 UI 전반의 디자인 요소를 체계화하고 디자인 가이드를 수립했습니다.",
      "이를 기반으로 PC·태블릿·모바일을 아우르는 반응형 웹을 설계하여 복잡한 공공 데이터를 직관적으로 전달하는 사용자 중심 포털로 개선하였습니다.",
    ],
  },
  {
    id: 21,
    name: "다중 비행장 원격 통합 관제 시스템 구조 시각화",
    url: "#",
    image: RTC_THUM,
    accent: "#0d9488",
    meta: "데이터 · 항공 관제",
    detailImage: RTC_THUM,
    detailImages: [...RTC_IMAGES],
    detailDesignTypes: "Control System, Visualization",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator",
    detailDescription: `여러 비행장을 원격으로 통합 관제하는 시스템의 제안 과정에서, 기획·기술 문서를 기반으로 복잡한 네트워크 구조를 이해하고, 연동 관계와 계층을 도식화하여 시각적으로 전달하는 작업을 담당했습니다.

* 분산된 공항, 관제 센터, 이동형 관제탑 간 시스템 구성을 분석
* 5G/LTE, WAN/LAN, 보안 장비 등 기술 요소 간 관계를 정리
* 이해하기 어려운 네트워크 흐름을 한눈에 파악할 수 있도록 구조도 설계
* 제안 문서 내에서 의사결정을 돕는 커뮤니케이션 도구로 활용

해당 프로젝트는 대외비로 인해 비식별화하여 표현하였습니다.`,
  },
  {
    id: 2,
    name: "SKT 해피해빗 앱 리뉴얼",
    url: "#",
    image: "/images/pf_happyhabit_m.png",
    accent: "#f97316", // 오렌지
    meta: "ESG · 리워드 플랫폼",
    detailImage: "/images/pf_happyhabit.png",
    detailDesignTypes: "App, UI/UX, Identity, Visual",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator, After Effects",
    detailDescription: `친환경 서비스 ‘해피해빗’ 앱 통합 구축 프로젝트에서 디자인 리드로 참여하여, 서비스 전반의 UI/UX 디자인을 4년간 전담했습니다.

다양한 기능이 혼재되어 있던 기존 화면을 재구성하여, 사용자가 현재 상태와 다음 행동을 명확히 인지할 수 있도록 흐름을 개선했습니다.

‘환경을 위한 행복한 습관’이라는 브랜드 방향성을 기반으로 브랜드 메시지가 자연스럽게 전달될 수 있도록 시각적 톤과 인터페이스를 재설계하고, 컬러·타이포그래피·아이콘 등 UI 요소를 정리하여 따뜻하고 긍정적인 브랜드 이미지를 강화했습니다.

서비스 확장 과정에서 사용자 흐름을 정교하게 다듬고, 애니메이션을 추가해 나가며 해피해빗이 ‘의무’가 아닌 ‘즐거운 경험’으로 인식되도록 고도화 해나갔습니다.`,
  },
  {
    id: 3,
    name: "대한적십자 헌혈앱 고도화",
    url: "#",
    image: REDCONNECT_THUM,
    accent: "#dc2626", // 레드
    meta: "공공 · 헬스케어",
    detailImage: REDCONNECT_THUM,
    detailImages: [...REDCONNECT_IMAGES],
    detailDesignTypes: "App, UI/UX, Mobile accessibility",
    detailTools: "Tool : XD, Photoshop, Illustrator",
    detailDescription: `‘레드커넥트’의 비대면 서비스 확대와 함께 사용자 경험 개선을 위한 고도화 디자인 리드를 담당하였습니다.

사용자 동선이 분절되어 있고 접근성 기준을 충족하지 못한 화면의 UX 개선을 위해 고객사의 요구사항과 서비스 방향을 반영하여 헌혈 예약부터 방문, 결과 확인, 증서 발급까지 이어지는 화면 흐름을 정리하였습니다.

비대면 중심의 서비스 화면으로 UI 구조 정의 및 접근성 작업으로, 공공 서비스 기준에 맞는 인터페이스로 정비하였습니다.

또한 기존 UI 패턴을 유지하면서 일관성을 유지하고, 백오피스 설계에 참여하여 운영 효율성과 관리 편의성을 고려한 서비스 구축에 기여하였습니다.

그 결과, 접근성 인증 마크를 획득하며 서비스 신뢰도를 강화하였고, 예약부터 발급까지 이어지는 비대면 헌혈 서비스 경험을 보다 안정적으로 제공할 수 있도록 개선하였습니다.`,
  },
  {
    id: 23,
    name: "SK Tech 아카데미 사이트 구축",
    url: "#",
    image: "/images/sta_thum.png",
    accent: "#0284c7",
    meta: "교육 · 에듀테크",
    detailImage: "/images/sta_thum.png",
    detailImages: [
      "/images/sta_thum.png",
      "/images/sta_detail1.png",
      "/images/sta_detail2.png",
    ],
    detailDesignTypes: "Web, UI/UX, Responsive",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator",
    detailDescription: `디지털 융합 인재 양성·체험 플랫폼을 전체 리뉴얼 했습니다.

플랫폼의 성격을 반영한 디자인 컨셉 수립과 메인 및 주요 화면, 스타일 가이드를 메인디자이너로서 담당했습니다.

실제 교육 현장 이미지를 활용해 서비스의 생동감을 전달하고, 교육·체험 정보와 예약 흐름을 직관적으로 설계해 사용 편의성을 높였습니다.`,
  },
  {
    id: 20,
    name: "MONOPLEX POS 시스템 구축",
    url: "#",
    image: MONOPLEX_THUM,
    accent: "#166534",
    meta: "오프라인 · 시스템",
    detailImage: MONOPLEX_DETAIL1,
    detailDesignTypes: "Kiosk, UI/UX, Dark Mode, Payment Flow",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator",
    detailDescription: `모노플렉스의 통합 결제 및 관리 시스템 구축 디자인을 전담하였습니다.

직관적인 UI와 다크 모드를 적용하여 시인성을 높이고 사용자 결제 동선을 최적화했습니다.`,
  },
  {
    id: 4,
    name: "헤르지온 앱 구축",
    url: "#",
    image: "/images/pf_herzion_m.png",
    accent: "#4f46e5", // 보라/블루
    meta: "헬스케어",
    detailImage: "/images/pf_herzion_m.png",
    detailDesignTypes: "App, UI/UX, Brand Identity, Character Design, Motion Graphic",
    detailTools: "Tool : XD, Photoshop, Illustrator, After Effects",
    detailParagraphs: [...HERZION_DETAIL_PARAGRAPHS],
    detailDescription: HERZION_DETAIL_PARAGRAPHS.join("\n\n"),
  },
  {
    id: 5,
    name: "구루핀월렛 앱 UI 리뉴얼",
    url: "#",
    image: GURUFIN_THUM,
    accent: "#1d4ed8", // 블루
    meta: "금융 · 핀테크",
    detailDesignTypes: "App, UI",
    detailTools: "Tool : XD, Photoshop, Illustrator",
    detailDescription: `블록체인 기반 디지털 자산 관리 서비스 '구루핀월렛’의 기존 앱은 전반적으로 정돈되어 있지 않고 딱딱한 인상을 주어, 서비스 특성에 맞는 시각적 개선을 위한 전체 화면 UI를 담당했습니다.

컬러, 타이포그래피, 컴포넌트 등 UI 전반의 디자인 요소를 체계화하고, 일관된 스타일 가이드를 정의하여 인터페이스를 정리하였습니다.

또한 금융 서비스의 신뢰감은 유지하면서도 과도하게 딱딱한 인상을 완화할 수 있도록 시각적 톤을 조정하였습니다.

화면 구성을 보다 명확하고 직관적으로 개선하였으며, 일관된 디자인 시스템을 기반으로 서비스 전반의 완성도와 가독성을 향상시켰습니다.`,
  },
  {
    id: 22,
    name: "SKT 해피해빗 SCM 구축",
    url: "#",
    image: HABITICT_THUM,
    accent: "#c2410c",
    meta: "운영시스템 · SCM",
    detailImage: HABITICT_THUM,
    detailImages: [...HABITICT_IMAGES],
    detailDesignTypes: "Web, Mobile, UI/UX, Admin, Data Table UX",
    detailTools: "Tool : Figma, XD, Photoshop, Illustrator",
    detailDescription: `다회용 컵·친환경 캠페인 서비스 ‘해피해빗’과 연계된 SCM 시스템입니다.

매장·반납기·물류·재고 등 운영 데이터를 다루고, 현장과 본부가 동일한 기준으로 의사결정할 수 있도록 관리 화면의 정보 구조와 업무 흐름을 설계하였습니다.

대량의 목록·상태·이력을 다루는 화면에서는 검색·필터·일괄 처리 등 조작 효율을 우선하고, 오류·지연·예외 상황이 직관적으로 드러나도록 정리하였습니다.

브랜드 톤과 맞춘 컬러·타이포로 해피해빗 서비스와 시각적 연속성을 유지하면서도, 운영 도구로서의 가독성과 신뢰감을 갖추도록 UI를 구성하였습니다.`,
  },
  {
    id: 6,
    name: "KB손해보험 전채널 서비스 운영",
    url: "#",
    image: "/images/pf_kb_m.png",
    accent: "#f97316", // 이미지 계열에 맞춘 오렌지 톤
    meta: "금융 · 보험",
    detailDesignTypes: "Web, Mobile, App, Maintenance, Publishing",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `KB손해보험의 서비스 운영 디자이너로 참여하여 보험 상품 및 이벤트 운영 디자인을 담당하였습니다.

주간 및 월간 단위로 진행되는 이벤트와 프로모션에 맞춰 메인 키비주얼 이미지를 제작하고, 배너·아이콘 등 서비스 전반의 시각 요소를 지속적으로 관리 및 개선하였습니다.

디자인 가이드를 기반으로 일관된 비주얼 톤을 유지하면서, 보험 상품 특성상 빈번하게 발생하는 콘텐츠 추가 및 변경 요청에 대응하여 신속하게 수정안을 반영하였고, HTML/CSS 퍼블리싱을 통해 실제 서비스에 적용될 수 있도록 지원하였습니다.

웹사이트, 모바일, 앱 등 다양한 플랫폼의 운영 특성을 고려하여 각 환경에 맞는 디자인을 제공하고, 반복적인 운영 환경에서도 일관된 디자인 품질을 유지하며 안정적인 서비스 운영을 유연하게 지원하였습니다.`,
  },
  {
    id: 7,
    name: "헤이폴 앱 구축",
    url: "#",
    image: "/images/pf_heypoll_m.png",
    accent: "#C52AD9", // 보라/핑크 계열 고정 컬러
    meta: "리워드 · 플랫폼",
    detailDesignTypes: "App, UI/UX, Promotions",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `리워드 기반 설문 참여 플랫폼 '헤이폴'은 사용자의 의견 참여를 콘텐츠화하고 포인트 보상을 통해 반복 사용을 유도하는 서비스로, 앱 런칭 단계에서 신규 BI를 반영한 UI 구축이 중요한 프로젝트였습니다.

신규 BI를 바탕으로 컬러, 타이포그래피, 컴포넌트 등 시각 요소를 정의하여 일관된 UI 스타일을 구축하고, 전체 페이지 디자인을 수행하였습니다.

또한 다양한 설문 및 이벤트 콘텐츠가 유연하게 적용될 수 있도록 화면 구조를 설계하여 서비스 전반의 일관성과 확장성을 고려한 디자인 기반을 마련하였습니다.

그 결과, 신규 브랜드 아이덴티티가 반영된 통일된 디자인 기반을 마련하여 서비스 런칭에 기여하였습니다.`,
  },
  {
    id: 8,
    name: "LG OLED SPACE 사이트 구축",
    url: "#",
    image: "/images/pf_oled_m.png",
    accent: "#BE1441", // 고정 배경 컬러
    meta: "브랜드 · 전시",
    detailDesignTypes: "Web, UI/UX",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `LG OLED SPACE 웹사이트는 OLED 기술의 강점과 차별성을 사용자에게 직관적으로 전달하기 위해 기획된 브랜드 콘텐츠 플랫폼입니다. 기술 중심의 정보를 나열하기보다, 비주얼 중심의 UI를 통해 OLED의 색감과 명암, 선명도를 감각적으로 전달하는 것이 중요한 프로젝트였습니다.

고해상도 이미지와 영상 중심의 인터페이스를 설계하여 OLED의 표현력을 효과적으로 드러내고, 콘텐츠 흐름에 따라 브랜드 메시지가 자연스럽게 전달될 수 있도록 웹과 모바일 환경에 맞는 화면을 구성하였습니다. 또한 다양한 디바이스 환경에서도 일관된 경험이 제공될 수 있도록 반응형 웹을 고려한 UI를 설계하였습니다.

그 결과, OLED 기술의 강점을 시각적으로 강조한 콘텐츠 중심의 웹사이트를 완성하였으며, 브랜드 메시지를 직관적으로 전달할 수 있는 비주얼 중심 UI를 구축하였습니다.`,
  },
  {
    id: 9,
    name: "정관장몰 상세페이지 UI/UX 개선",
    url: "#",
    image: "/images/pf_kgcshop_m.png",
    accent: "#b91c1c", // 레드 계열
    meta: "커머스",
    detailDesignTypes: "Detail Page, UI/UX, Graphic Design",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `자사몰과 외부몰 간 상세페이지 구성과 톤앤매너가 일관되지 않아 브랜드 경험이 분산되는 문제 해결을 위해 2명의 디자이너가 약 250여 개 상품의 상세페이지를 모바일, 웹, 외부몰, 중국어 버전으로 확장 적용할 수 있도록 체계적인 베리에이션 작업을 진행하였습니다.

상세페이지 구조와 비주얼 톤을 재정비하고, 상품군(건강식품, 화장품, 반려동물식품)별 콘셉트를 구분하여 각 제품의 특징이 명확하게 전달될 수 있도록 콘텐츠 구성을 정리하였습니다.

또한 제형, 크기 등 핵심 정보를 직관적으로 전달할 수 있도록 아이콘 에셋을 제작하고, 다양한 환경에서도 일관된 표현이 가능하도록 디자인 가이드를 수립하였습니다.`,
  },
  {
    id: 10,
    name: "영진전문대학 & 입학처 사이트 구축",
    url: "#",
    image: "/images/pf_yju_m.png",
    accent: "#007fa0", // 대학 마크 컬러
    meta: "교육",
    detailDesignTypes: "Web, Mobile",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `영진전문대학 웹사이트 및 입학처 사이트는 입학, 학과, 공지 등 다양한 정보를 사용자에게 명확하게 전달하는 것이 중요한 교육 서비스 플랫폼입니다. 특히 방대한 정보 구조와 복잡한 메뉴 체계를 효율적으로 정리하여 가독성과 접근성이 필요했습니다.

대학의 심벌마크와 시그니처 컬러를 디자인 요소로 활용하여 브랜드 아이덴티티를 UI 전반에 반영하고, 정보의 우선순위를 고려한 레이아웃과 텍스트 구조를 설계하여 사용자가 필요한 정보를 빠르게 탐색할 수 있도록 화면을 구성하였습니다.

또한 PC와 모바일 환경을 고려한 반응형 웹 디자인을 적용하여 다양한 디바이스에서도 일관된 정보 전달이 가능하도록 UI를 구축하였습니다.`,
  },
  {
    id: 11,
    name: "전통시장화재공제 사이트 구축",
    url: "#",
    image: "/images/pf_semas_m.png",
    accent: "#ea580c", // 오렌지
    meta: "공공 · 보험",
    detailDesignTypes: "Web, Design System",
    detailTools: "Tool : Photoshop, Illustrator",
    detailDescription: `전통시장화재공제 웹사이트는 전통시장 상인을 대상으로 화재 피해를 대비할 수 있는 공제 제도를 안내하고 가입을 유도하는 공공 서비스 플랫폼으로, 복잡한 제도를 쉽고 직관적으로 전달하는 것이 중요한 프로젝트였습니다.

사용자의 이해도를 높이기 위해 정보 구조를 단순화하고, 공제 개념과 가입 절차를 직관적으로 전달할 수 있도록 전체 페이지 UI를 설계하였습니다. 특히 가입 과정에서의 진입 장벽을 낮추기 위해 단계별 흐름을 간소화하고, 사용자가 자연스럽게 선택하며 진행할 수 있는 인터페이스를 구성하였습니다.

또한 디자인 가이드를 수립하여 퍼블리싱 및 개발 과정에서도 일관된 UI가 유지될 수 있도록 기반을 마련하고, 서비스 전반에 걸쳐 안정적인 디자인 품질을 유지할 수 있도록 하였습니다.

그 결과, 복잡한 공제 서비스에 대한 이해도를 높이는 접근성 웹사이트를 구축하였으며, 사용자 친화적인 가입 흐름을 통해 서비스 이용 활성화에 기여할 수 있는 기반을 마련하였습니다.`,
  },
  {
    id: 13,
    name: "SK엔카 ERP 구축",
    url: "#",
    image: "/images/pf_skncar_m.jpg?v=5",
    accent: "#ea580c", // 오렌지 (기존 다크 브라운보다 밝게, 다른 프로젝트 톤과 맞춤)
    meta: "기업 · 시스템",
    detailDesignTypes: "Design System, Publishing",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
    detailDescription: `SK엔카의 사업 운영을 지원하는 내부 관리 시스템은 방대한 거래 데이터와 지점별 운영 현황을 효율적으로 관리하는 것이 중요한 플랫폼으로, 분산된 업무 환경에서도 일관된 사용 경험과 높은 가독성에 집중하였습니다.

넥사크로 기반의 인터페이스와 컴포넌트를 설계하고, 대시보드를 통해 지점별 판매 현황을 직관적으로 비교하고 빠르게 파악할 수 있도록 데이터 시각화 중심의 UI를 구성하였습니다. 또한 반복적으로 사용되는 UI 요소를 체계화하여 화면 간 일관성을 유지하고, 사용자의 학습 부담을 줄일 수 있도록 인터페이스를 정리하였습니다.

더불어 시스템 전반에 적용 가능한 디자인 가이드를 수립하여 지점 및 조직별로 동일한 UI 환경을 유지하여 지점 간 업무 환경의 차이를 줄이고 일관된 사용자 경험과 업무 수행 방식을 지원할 수 있는 UI 체계를 마련하였습니다.`,
  },
  {
    id: 15,
    name: "미래에셋 OMS 구축",
    url: "#",
    image: "/images/pf_miraeasset_m.png",
    accent: "#1d4ed8", // 블루
    meta: "금융 · 시스템",
    detailDesignTypes: "Design System, Publishing",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
    detailDescription: `미래에셋증권의 OMS(Order Management System)는 대량의 금융 데이터를 기반으로 빠른 의사결정과 정확한 업무 처리가 요구되는 내부 업무 시스템으로, 장시간 사용 환경에서도 효율적이고 일관된 UI를 제공하는 것이 중요한 프로젝트였습니다.

이에 넥사크로 기반의 인터페이스와 컴포넌트를 설계하고, 사용자 업무 유형과 개인 선호에 따라 화면 구성이 가능하도록 Floating Mode와 Frame Mode의 2가지 레이아웃 구조를 정의하였습니다. 또한 4가지 컬러 테마를 제공하여 사용자 환경에 맞춘 개인화 UI를 구현하고, MindMap 기반의 메뉴 구조를 통해 주요 기능에 빠르게 접근할 수 있도록 인터페이스를 설계하였습니다.

더불어 시스템 전반에 적용 가능한 디자인 가이드를 수립하여 화면 간 일관성을 유지하고, 반복 업무에 대한 학습 부담을 줄일 수 있도록 UI 표준을 정리하였습니다.

그 결과, 사용자 맞춤형 UI 환경을 통해 업무 몰입도와 처리 효율을 향상시켰으며, 데이터 중심 업무에 적합한 정보 구조와 인터페이스를 기반으로 빠른 정보 파악과 의사결정을 지원할 수 있는 확장 가능한 시스템을 구축하였습니다.`,
  },
  {
    id: 12,
    name: "현대자동차연구소 표준개발시스템 구축",
    url: "#",
    image: "/images/pf_hyundaimotorgroup_m.jpg",
    accent: "#0A2366", // 현대 브랜드 딥 블루 (hover 배경 고정)
    meta: "기업 · 시스템",
    detailDesignTypes: "Design System, Publishing",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
  },
  {
    id: 14,
    name: "한국스마트카드 ERP 구축",
    url: "#",
    image: "/images/pf_tmoney_m.png",
    accent: "#898989", // RGB 137,137,137 (hover 배경 고정)
    meta: "기업 · 시스템",
    detailDesignTypes: "Design System, Publishing",
    detailTools: "Tool : Nexacro, Photoshop, Illustrator",
  },
  {
    id: 16,
    name: "베페몰 앱 구축",
    url: "#",
    image: "/images/pf_befemall_m.png",
    accent: "#fb7185", // 코랄/핑크
    meta: "커머스 · O2O",
    detailDesignTypes: "App",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 17,
    name: "LG U+ 모바일웹 구축 서브디자인",
    url: "#",
    image: "/images/pf_lguplus_m.png",
    accent: "#898989", // RGB 137,137,137 (hover 배경 고정)
    meta: "기업 · 통신",
    detailDesignTypes: "Mobile, Graphic Design",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 18,
    name: "풀무원 아미오 사이트 구축",
    url: "#",
    image: "/images/pf_amio_m.png",
    accent: "#16a34a", // 그린
    meta: "커머스",
    detailDesignTypes: "Web, Visual Design",
    detailTools: "Tool : Photoshop, Illustrator",
  },
  {
    id: 19,
    name: "경희대학교 국문사이트 구축",
    url: "#",
    image: "/images/pf_kyunghee_m.png",
    accent: "#334155", // 블루 그레이
    meta: "교육",
    detailDesignTypes: "Web, Web Accessibility",
    detailTools: "Tool : Photoshop, Illustrator",
  },
];

/**
 * 메인 사이드바·프로젝트 뷰 순서.
 * 카드 번호 02·04·06에 해당하던 항목(id 21, 22, 20)은 /v2 이후 추가 분위기로 메인에서 제외.
 */
const MAIN_MENU_PROJECT_ORDER: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 12, 14, 16, 17, 18, 19,
];

/**
 * 메인 메뉴 전용: 쇼케이스에서 바뀐 카피만 덮어씀 (21·22·20은 메인 목록에 없음).
 */
const LEGACY_PROJECT_OVERRIDES: Partial<
  Record<number, Partial<ProjectItem> & { clearDetailImages?: true }>
> = {
  2: {
    detailDescription: `다회용 컵 이용을 습관화해 일회용 컵 감축과 환경 보호를 돕는 앱 '해피해빗(happy habit)' 리뉴얼·기획 성격의 프로젝트입니다. 콘셉트는 '다회용 컵을 쓰는 반가운 습관'으로, 인식과 실제 행동 사이의 간극을 줄이는 것이 과제였습니다.

목표로는 QR·바코드 등으로 반납·이용을 단순하게 만드는 것, 절감한 컵 수·CO₂ 등 영향을 시각화해 동기를 주는 것, 사용자들이 에코 습관을 나눌 수 있는 커뮤니티를 만드는 것을 두었습니다. 키워드는 단순함, 습관, 친환경입니다.

디자인 시스템은 신뢰와 청결감을 주는 블루(#2E58FF 등)를 메인으로 하고, 밝은 그레이·화이트로 여백감 있는 앱 톤을 맞추었습니다. 핵심 기능으로는 홈에서의 식별용 코드·포인트(해피 포인트), 습관·환경 기여 통계 대시보드, 지도 기반 참여 카페·반납기(해피 스테이션) 탐색 및 매장 카드, 사진 피드형 커뮤니티(좋아요·댓글) 등이 제시됩니다. 카페·사무실·일상 사용 등 시나리오 목업으로 실사용 맥락을 보여 줍니다.

그 결과  시행 2년만에 일회용 컵 1,000만개를 절감하고, 탄소배출을 약 293톤 저감하였고, 리사이클 서비스로 확대로 ‘AI 분리배출 가이드’ 를 작업하여 UN 지속가능 발전 목표 기여 우수 모바일상 수상에 기여하였습니다.`,
  },
};

function toMainMenuProject(
  base: ProjectItem,
  override?: Partial<ProjectItem> & { clearDetailImages?: true }
): ProjectItem {
  if (!override) return base;
  const { clearDetailImages, ...rest } = override;
  const merged: ProjectItem = { ...base, ...rest };
  if (clearDetailImages) {
    delete merged.detailImages;
  }
  return merged;
}

/** 메인(레이아웃) 프로젝트 메뉴·ProjectView — /v2 이전 카피·순서 */
export const PROJECTS: ProjectItem[] = MAIN_MENU_PROJECT_ORDER.map((id) => {
  const base = SHOWCASE_PROJECTS.find((p) => p.id === id);
  if (!base) {
    throw new Error(`SHOWCASE_PROJECTS missing id ${id}`);
  }
  return toMainMenuProject(base, LEGACY_PROJECT_OVERRIDES[id]);
});

/**
 * 프로젝트 메뉴(리스트)에는 노출하지 않지만, 채팅 LLM 컨텍스트에는 포함할 경험.
 * 답변 시 사실로 인용 가능. 사용자에게는「프로젝트 메뉴에서 보기」로 안내하지 말 것.
 */
const CHAT_ONLY_PORTFOLIO_KNOWLEDGE_BLOCKS: {
  title: string;
  meta?: string;
  designTypes?: string;
  tools?: string;
  description: string;
}[] = [
  {
    title:
      "AVCS·다중 비행장 원격 관제 UX 제안 (항공정보포털 AirPortal과 별도 · UI 카드 미노출)",
    meta: "데이터 · 관제 / 제안",
    designTypes:
      "Control System UX, Real-time Data Visualization, Information Hierarchy, Proposal",
    tools: "Tool : Figma, XD, Photoshop, Illustrator",
    description: `항공정보포털(AirPortal)과는 별도 프로젝트로, AVCS(공항 에어사이드 차량통제 관제시스템)와 다중 비행장 원격 관제 제안 과정에 참여하였습니다.

방대한 실시간 데이터나 복잡한 정보 사이의 위계를 정립하고, 사용자가 지금 당장 판단해야 할 정보를 중심으로 시각화하는 설계에 집중하였습니다.`,
  },
];

function formatChatOnlyKnowledgeBlock(block: (typeof CHAT_ONLY_PORTFOLIO_KNOWLEDGE_BLOCKS)[number]): string {
  const lines: string[] = [`[비리스트·LLM용] ${block.title}`];
  if (block.meta) lines.push(`유형: ${block.meta}`);
  if (block.designTypes?.trim()) {
    lines.push(`Design 범위: ${block.designTypes}`);
  }
  if (block.tools?.trim()) lines.push(block.tools);
  lines.push("상세 설명:");
  lines.push(block.description.trim());
  lines.push(
    "안내: 이 항목은 포트폴리오 화면의 프로젝트 카드 목록에 없음. 사용자에게 프로젝트 메뉴에서 해당 카드를 찾도록 유도하지 말 것."
  );
  return lines.join("\n");
}

export function getPortfolioKnowledgeForChat(): string {
  const fromList = PROJECTS.map((p) => {
    const lines: string[] = [`[${p.id}] ${p.name}`];
    if (p.meta) lines.push(`유형: ${p.meta}`);
    if (p.detailDesignTypes?.trim()) {
      lines.push(`Design 범위: ${p.detailDesignTypes}`);
    }
    if (p.detailTools?.trim()) {
      lines.push(p.detailTools);
    }
    const body =
      p.detailDescription?.trim() ||
      p.detailParagraphs?.map((t) => t.trim()).filter(Boolean).join("\n\n");
    if (body) {
      lines.push("상세 설명:");
      lines.push(body);
    } else {
      lines.push(
        "상세: 등록된 본문 카피 없음. 이 블록에 있는 프로젝트명·유형·Design/Tool 정보만 사실로 쓸 것. 그 밖의 스토리는 지어내지 말고, 없다고 말한 뒤 필요하면 프로젝트 메뉴에서 확인하도록 안내."
      );
    }
    return lines.join("\n");
  }).join("\n\n---\n\n");

  const chatOnly = CHAT_ONLY_PORTFOLIO_KNOWLEDGE_BLOCKS.map(
    formatChatOnlyKnowledgeBlock
  ).join("\n\n---\n\n");

  return `${fromList}\n\n---\n\n${chatOnly}`;
}
