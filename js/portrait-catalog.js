/* 실제 CG와 대본의 표정 키를 분리합니다. 별칭은 기존 저장 위치를 유지합니다. */
window.VN_PORTRAIT_CATALOG = [
  { character: '레밀리아', folder: '레밀리아_new', frame: 'gown', variants: [
    ["neutral","기본 · 경청",["normal","listening"]],
    ["smile","미소 · 대화",["softSmile","talkingSmile","interested","teasing"]],
    ["laugh","웃음",["laugh"]],
    ["thinking","생각 · 눈치",["watchful","reluctant","thinking","possessive","smallGlance"]],
    ["shy","부끄러움",["shy","embarrassed","slightShy","hiding","bashful","praised"]],
    ["surprised","놀람",["flustered","surprised","bigGlance"]],
    ["sad","슬픔",["sad","hollow"]],
    ["angry","화남 · 경고",["angry","disdain"]],
    ["furious","격노 · 추방 선언",["furious"],"confrontation"],
    ["fury-full","격노 전신 · 나가",["remiliaFuryFull"],"intimidation-wide"],
    ["pout","삐짐",["pouting","afterPraise","stopTeasing"]],
    ["back-regal","뒷모습 · 홍마관의 주인",["backPose"]],
    ["back-flustered","뒷모습 · 당황과 헛기침",["backFlustered","backSigh"]],
    ["back-reflective","뒷모습 · 회상",["backThink","backLook"]]
  ] },
  { character: '사쿠야', folder: '사쿠야_new', frame: 'standing', variants: [
    ["neutral","기본",["sakuyaNormal"]],
    ["smile","미소 · 안내",["sakuyaSmile"]],
    ["serious","진지함 · 의심",["sakuyaSerious","sakuyaSuspicious","sakuyaChiding"]],
    ["troubled","곤란",["sakuyaTroubled"]],
    ["cold","냉정 · 제지",["sakuyaCold"]],
    ["alarmed","긴장 · 보호",["sakuyaAlarmed","sakuyaSurprised"]],
    ["furious","분노 · 차가운 경고",["sakuyaFurious"],"confrontation"],
    ["fury-full","분노 전신 · 통행 차단",["sakuyaFuryFull"],"intimidation-tall"]
  ] },
  { character: '파츄리', folder: '파츄리', frame: 'standing', variants: [
    ["neutral","기본 · 대화",["patchouliNormal","patchouliTalking","patchouliSurprised"]],
    ["sorry","미안함",["patchouliSorry"]],
    ["smile","미소 · 찻잔",["patchouliSmile"]],
    ["full","전신 · 독서",["patchouliFull"],"full"]
  ] },
  { character: '레이무', folder: '레이무', frame: 'standing', variants: [
    ["neutral","기본 · 기다림",["reimuNormal"]],
    ["thinking","생각 · 매듭끈의 단서",["reimuThinking"]],
    ["eyes-closed","눈을 감고 생각",["reimuEyesClosed"]],
    ["stop-thinking","생각을 멈춤",["reimuStopThinking"]],
    ["bored","지루함 · 턱 괴기",["reimuBored"]],
    ["sigh","한숨",["reimuSigh"]]
  ] }
];
