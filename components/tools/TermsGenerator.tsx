"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download } from "lucide-react";
import { ChannelTalkButton } from "@/components/layout/ChannelTalk";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useReducedMotionSafe } from "@/hooks/useReducedMotionSafe";

/* 이용약관 생성기.
   공정거래위원회 전자상거래 표준약관의 조항 구성을 따라, 사이트 유형과 회원가입·유료 결제·게시물 여부를 고르면
   필요한 조항만 골라 조 번호를 매겨 준다. 입력값은 이 브라우저에만 저장한다. */

const EASE = [0.23, 1, 0.32, 1] as const;
const STORAGE_KEY = "gs-tool:terms:v1";

const SITE_TYPES = ["일반 홈페이지", "회원제 서비스", "쇼핑몰"] as const;
type SiteType = (typeof SITE_TYPES)[number];

const GOODS = ["배송 상품", "디지털 콘텐츠·온라인 서비스"] as const;
type Goods = (typeof GOODS)[number];

const COURTS = ["이용자 주소지 관할 지방법원", "민사소송법에 따른 관할 법원"] as const;
type Court = (typeof COURTS)[number];

interface Form {
  siteType: SiteType;
  company: string;
  siteName: string;
  siteUrl: string;
  contact: string;
  membership: boolean;
  paid: boolean;
  goods: Goods;
  withdrawDays: number;
  posts: boolean;
  court: Court;
  effectiveDate: string;
}

const PRESETS: Record<SiteType, Pick<Form, "membership" | "paid" | "goods" | "posts">> = {
  "일반 홈페이지": { membership: false, paid: false, goods: "배송 상품", posts: false },
  "회원제 서비스": { membership: true, paid: false, goods: "디지털 콘텐츠·온라인 서비스", posts: true },
  쇼핑몰: { membership: true, paid: true, goods: "배송 상품", posts: true },
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const initialForm: Form = {
  siteType: "쇼핑몰",
  company: "",
  siteName: "",
  siteUrl: "",
  contact: "",
  ...PRESETS["쇼핑몰"],
  withdrawDays: 7,
  court: "이용자 주소지 관할 지방법원",
  effectiveDate: "",
};

// 조항 본문: 일반 문장, 번호 매긴 항(①②), 목록
// 항 아래에 호 목록이 붙는 경우 sub로 넣는다
type Item = string | { text: string; sub: string[] };
type Part = { kind: "p"; text: string } | { kind: "ol"; items: Item[] } | { kind: "ul"; items: string[] };
interface Section {
  id: string;
  title: string;
  parts: Part[];
}

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩";
const blank = (v: string, label: string) => v.trim() || `[${label}]`;

function build(f: Form): Section[] {
  const co = blank(f.company, "회사명");
  const site = blank(f.siteName, "사이트 이름");
  const url = f.siteUrl.trim() ? ` (${f.siteUrl.trim()})` : "";
  const shop = f.siteType === "쇼핑몰";
  const digital = f.goods === "디지털 콘텐츠·온라인 서비스";
  const days = Math.max(7, f.withdrawDays || 7);
  const fixDate = f.effectiveDate ? f.effectiveDate.replace(/-/g, ". ") + "." : "[시행일]";

  const sections: Section[] = [
    {
      id: "purpose",
      title: "목적",
      parts: [
        {
          kind: "p",
          text: `이 약관은 ${co}(이하 "회사")가 운영하는 ${site}${url}(이하 "사이트")에서 제공하는 ${f.paid ? "인터넷 관련 서비스와 재화·용역의 거래" : "인터넷 관련 서비스"}(이하 "서비스")를 이용할 때 회사와 이용자의 권리, 의무 및 책임 사항을 정하는 것을 목적으로 합니다.`,
        },
      ],
    },
    {
      id: "define",
      title: "정의",
      parts: [
        {
          kind: "ol",
          items: [
            `"사이트"란 회사가 ${f.paid ? "재화 또는 용역(이하 \"재화 등\")을 이용자에게 제공하기 위하여" : "서비스를 제공하기 위하여"} 컴퓨터 등 정보통신설비를 이용하여 마련한 가상의 영업장을 말합니다.`,
            `"이용자"란 사이트에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 ${f.membership ? "회원 및 비회원" : "사람"}을 말합니다.`,
            ...(f.membership
              ? [
                  `"회원"이란 회사에 개인정보를 제공하여 회원 등록을 한 사람으로서, 사이트의 정보를 지속적으로 제공받으며 회사가 제공하는 서비스를 계속 이용할 수 있는 사람을 말합니다.`,
                  `"비회원"이란 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 사람을 말합니다.`,
                ]
              : []),
            ...(f.posts ? [`"게시물"이란 이용자가 서비스를 이용하며 사이트에 올린 글, 사진, 동영상, 각종 파일과 링크 등을 말합니다.`] : []),
          ],
        },
      ],
    },
    {
      id: "notice",
      title: "약관의 명시와 개정",
      parts: [
        {
          kind: "ol",
          items: [
            "회사는 이 약관의 내용과 상호, 대표자 성명, 영업소 소재지 주소, 전화번호, 전자우편 주소, 사업자등록번호" + (f.paid ? ", 통신판매업 신고번호" : "") + " 등을 이용자가 쉽게 알 수 있도록 사이트 초기 화면에 게시합니다. 약관 내용은 연결 화면으로 볼 수 있게 할 수 있습니다.",
            `회사는 「약관의 규제에 관한 법률」${f.paid ? ", 「전자상거래 등에서의 소비자보호에 관한 법률」" : ""}, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법을 위반하지 않는 범위에서 이 약관을 개정할 수 있습니다.`,
            "회사가 약관을 개정할 때에는 적용 일자와 개정 사유를 밝혀 현행 약관과 함께 적용 일자 7일 전부터 적용 일자 전날까지 사이트에 공지합니다. 다만 이용자에게 불리하게 개정하는 경우에는 30일 전부터 공지합니다.",
            "개정 약관은 적용 일자 이후에 체결되는 계약에만 적용되며, 그 전에 이미 체결된 계약에는 개정 전 약관을 적용합니다.",
          ],
        },
      ],
    },
    {
      id: "interpret",
      title: "약관의 해석",
      parts: [
        {
          kind: "p",
          text: `이 약관에서 정하지 않은 사항과 이 약관의 해석은 「약관의 규제에 관한 법률」${f.paid ? ", 「전자상거래 등에서의 소비자보호에 관한 법률」, 공정거래위원회가 정하는 전자상거래 등에서의 소비자 보호지침" : ""} 및 관계 법령 또는 상관례에 따릅니다.`,
        },
      ],
    },
    {
      id: "service",
      title: "서비스의 제공 및 변경",
      parts: [
        {
          kind: "ol",
          items: [
            {
              text: "회사는 다음 업무를 수행합니다.",
              sub: shop
            ? ["재화 등에 대한 정보 제공 및 구매계약의 체결", "구매계약이 체결된 재화 등의 배송", "그 밖에 회사가 정하는 업무"]
            : f.paid
              ? ["서비스 및 이용권에 대한 정보 제공과 이용계약의 체결", "계약이 체결된 서비스의 제공", "그 밖에 회사가 정하는 업무"]
              : ["회사와 서비스에 대한 정보 제공", "문의 접수와 답변", "그 밖에 회사가 정하는 업무"],
            },
            "회사는 서비스 내용을 변경할 수 있으며, 이 경우 변경된 내용과 제공 일자를 명시하여 사이트에 즉시 공지합니다.",
          ],
        },
      ],
    },
    {
      id: "stop",
      title: "서비스의 중단",
      parts: [
        {
          kind: "ol",
          items: [
            "회사는 컴퓨터 등 정보통신설비의 보수 점검, 교체 및 고장, 통신 두절 등의 사유가 생긴 경우 서비스 제공을 일시적으로 중단할 수 있습니다.",
            `서비스를 중단하는 경우 회사는 사이트 공지${f.membership ? " 또는 회원에 대한 통지" : ""}로 이용자에게 알립니다. 다만 회사가 미리 알릴 수 없는 부득이한 사유가 있는 경우에는 사후에 알릴 수 있습니다.`,
          ],
        },
      ],
    },
  ];

  if (f.membership) {
    sections.push(
      {
        id: "join",
        title: "회원가입",
        parts: [
          {
            kind: "ol",
            items: [
              "이용자는 회사가 정한 가입 양식에 따라 회원 정보를 기입한 뒤 이 약관에 동의한다는 의사를 표시하여 회원가입을 신청합니다.",
              {
                text: "회사는 회원가입을 신청한 이용자 중 다음에 해당하지 않는 한 회원으로 등록합니다.",
                sub: ["가입 신청자가 이전에 회원 자격을 잃은 적이 있는 경우 (회사의 재가입 승낙을 얻은 경우는 제외)", "등록 내용에 허위, 누락, 오기가 있는 경우", "그 밖에 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우"],
              },
              "회원가입 계약은 회사의 승낙이 회원에게 도달한 때에 성립합니다.",
              "회원은 가입 시 등록한 사항이 바뀐 경우 지체 없이 회원 정보 수정 등의 방법으로 회사에 알려야 합니다.",
            ],
          },
        ],
      },
      {
        id: "leave",
        title: "회원 탈퇴 및 자격 상실",
        parts: [
          {
            kind: "ol",
            items: [
              "회원은 언제든지 탈퇴를 요청할 수 있으며, 회사는 즉시 회원 탈퇴를 처리합니다.",
              {
                text: "회원이 다음에 해당하는 경우 회사는 회원 자격을 제한하거나 정지할 수 있습니다.",
                sub: [
              "가입 신청 시 허위 내용을 등록한 경우",
              ...(f.paid ? ["사이트를 이용하여 구입한 재화 등의 대금, 그 밖에 이용에 관련하여 회원이 부담하는 채무를 기일에 지급하지 않는 경우"] : []),
              "다른 사람의 사이트 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우",
              "사이트를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우",
                ],
              },
              "회사가 회원 자격을 상실시키는 경우 회원에게 이를 알리고, 회원 등록을 말소하기 전에 최소 30일 이상의 기간을 정하여 소명할 기회를 줍니다.",
            ],
          },
        ],
      },
      {
        id: "notify",
        title: "회원에 대한 통지",
        parts: [
          {
            kind: "ol",
            items: [
              "회사가 회원에게 통지할 때에는 회원이 회사에 제출한 전자우편 주소나 휴대전화번호로 할 수 있습니다.",
              "회사는 불특정 다수 회원에게 통지할 때에는 1주일 이상 사이트 게시판에 게시하는 것으로 개별 통지를 대신할 수 있습니다. 다만 회원 본인의 거래와 관련하여 중대한 영향을 미치는 사항은 개별 통지합니다.",
            ],
          },
        ],
      },
    );
  }

  if (f.paid) {
    const item = shop ? "재화 등" : "서비스";
    sections.push(
      {
        id: "order",
        title: shop ? "구매신청" : "이용 신청",
        parts: [
          {
            kind: "p",
            text: `이용자는 사이트에서 다음 방법으로 ${shop ? "구매를" : "이용을"} 신청하며, 회사는 이용자가 ${shop ? "구매신청" : "이용 신청"}을 할 때 다음 내용을 알기 쉽게 제공합니다.`,
          },
          {
            kind: "ul",
            items: [
              `${item}의 검색 및 선택`,
              ...(shop ? ["받는 사람의 성명, 주소, 전화번호 입력"] : []),
              `약관 내용, 청약철회권이 제한되는 서비스, ${shop ? "배송료·설치비 등 " : ""}비용 부담과 관련한 내용의 확인`,
              "이 약관에 동의하고 위 사항을 확인하거나 거부하는 표시",
              `${item}의 ${shop ? "구매신청" : "이용 신청"} 및 이에 관한 확인 또는 회사의 확인에 대한 동의`,
              "결제 방법의 선택",
            ],
          },
        ],
      },
      {
        id: "contract",
        title: "계약의 성립",
        parts: [
          {
            kind: "ol",
            items: [
              `회사는 신청 내용에 허위, 누락, 오기가 있거나 미성년자가 담배, 주류 등 청소년보호법에서 금지하는 ${item}을 구매하는 경우 등에는 승낙하지 않을 수 있습니다.`,
              "회사의 승낙이 수신확인통지 형태로 이용자에게 도달한 시점에 계약이 성립한 것으로 봅니다.",
              "회사의 승낙 의사표시에는 이용자의 신청에 대한 확인, 판매 가능 여부, 신청의 정정·취소 등에 관한 정보를 포함합니다.",
            ],
          },
        ],
      },
      {
        id: "pay",
        title: "대금 지급 방법",
        parts: [
          { kind: "p", text: `사이트에서 구매한 ${item}의 대금은 다음 방법 중 사용 가능한 방법으로 지급할 수 있습니다. 회사는 대금 지급 방법에 대하여 어떠한 명목의 수수료도 추가로 받지 않습니다.` },
          { kind: "ul", items: ["신용카드, 체크카드 결제", "계좌이체, 무통장입금", "간편결제 등 전자결제 수단", "그 밖에 회사가 정한 결제 수단"] },
        ],
      },
      ...(shop
        ? [
            {
              id: "deliver",
              title: "재화 등의 공급",
              parts: [
                {
                  kind: "ol" as const,
                  items: [
                    "회사는 별도의 약정이 없는 한 이용자가 청약을 한 날부터 7일 이내에 재화 등을 배송할 수 있도록 주문 제작, 포장 등 필요한 조치를 합니다. 다만 대금의 전부 또는 일부를 미리 받은 경우에는 받은 날부터 3영업일 이내에 조치합니다.",
                    "회사는 재화 등의 배송 수단, 수단별 배송 비용 부담자, 수단별 배송 기간 등을 명시합니다.",
                  ],
                },
              ],
            },
          ]
        : []),
      {
        id: "refund",
        title: "환급",
        parts: [
          {
            kind: "p",
            text: `회사는 이용자가 ${shop ? "구매신청" : "이용 신청"}한 ${item}이 품절 등의 사유로 제공할 수 없을 때에는 지체 없이 그 사유를 이용자에게 알리고, 대금을 미리 받은 경우에는 받은 날부터 3영업일 이내에 환급하거나 환급에 필요한 조치를 합니다.`,
          },
        ],
      },
      {
        id: "withdraw",
        title: "청약철회 등",
        parts: [
          {
            kind: "ol",
            items: [
              `회사와 ${item}의 구매에 관한 계약을 체결한 이용자는 계약 내용에 관한 서면을 받은 날${shop ? "(그 서면을 받은 때보다 재화 등의 공급이 늦게 이루어진 경우에는 재화 등을 공급받거나 공급이 시작된 날)" : ""}부터 ${days}일 이내에 청약을 철회할 수 있습니다.`,
              {
                text: "이용자는 다음에 해당하는 경우에는 반품 및 교환 등 청약철회를 할 수 없습니다.",
                sub: digital
              ? [
                  "이용자의 책임 있는 사유로 서비스가 멸실 또는 훼손된 경우",
                  "디지털 콘텐츠의 제공이 개시된 경우 (다만 가분적 콘텐츠로 구성된 계약에서 제공이 개시되지 않은 부분은 제외)",
                  "그 밖에 거래의 안전을 위하여 대통령령으로 정하는 경우",
                ]
              : [
                  "이용자의 책임 있는 사유로 재화 등이 멸실 또는 훼손된 경우 (내용 확인을 위하여 포장 등을 훼손한 경우는 제외)",
                  "이용자의 사용 또는 일부 소비로 재화 등의 가치가 현저히 감소한 경우",
                  "시간이 지나 다시 판매하기 곤란할 정도로 재화 등의 가치가 현저히 감소한 경우",
                  "같은 성능을 지닌 재화 등으로 복제가 가능한 경우 그 원본인 재화 등의 포장을 훼손한 경우",
                ],
              },
              `${item}의 내용이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우에는 ${item}을 공급받은 날부터 3개월 이내, 그 사실을 안 날 또는 알 수 있었던 날부터 30일 이내에 청약철회를 할 수 있습니다.`,
            ],
          },
          {
            kind: "p",
            text: `회사는 청약철회가 제한되는 ${item}에 대해서는 그 사실을 ${item}의 포장이나 이용자가 쉽게 알 수 있는 곳에 명확하게 적거나${digital ? " 시험 사용 상품을 제공하는 등의 방법으로" : ""} 청약철회 권리 행사가 방해받지 않도록 조치합니다.`,
          },
        ],
      },
      {
        id: "withdraw-effect",
        title: "청약철회 등의 효과",
        parts: [
          {
            kind: "ol",
            items: [
              `회사는 이용자로부터 ${shop ? "재화 등을 반환받은" : "청약철회 의사를 받은"} 경우 3영업일 이내에 이미 지급받은 대금을 환급합니다. 환급을 늦춘 경우에는 그 지연 기간에 대하여 「전자상거래 등에서의 소비자보호에 관한 법률 시행령」에서 정하는 지연이자율을 곱하여 산정한 지연이자를 지급합니다.`,
              "이용자가 신용카드 또는 전자화폐 등으로 대금을 지급한 경우에는 회사는 지체 없이 해당 결제 수단을 제공한 사업자에게 대금 청구를 정지 또는 취소하도록 요청합니다.",
              ...(shop
                ? [
                    "청약철회 등의 경우 공급받은 재화 등의 반환에 필요한 비용은 이용자가 부담하며, 회사는 이용자에게 청약철회 등을 이유로 위약금 또는 손해배상을 청구하지 않습니다. 다만 재화 등의 내용이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행되어 청약철회 등을 하는 경우 반환 비용은 회사가 부담합니다.",
                  ]
                : ["회사는 이용자에게 청약철회 등을 이유로 위약금 또는 손해배상을 청구하지 않습니다."]),
            ],
          },
        ],
      },
    );
  }

  sections.push(
    {
      id: "privacy",
      title: "개인정보보호",
      parts: [
        {
          kind: "p",
          text: "회사는 이용자의 개인정보를 「개인정보 보호법」 등 관계 법령에 따라 보호하며, 개인정보의 수집, 이용, 보관, 파기 등에 관한 자세한 사항은 사이트에 게시한 개인정보 처리방침에 따릅니다.",
        },
      ],
    },
    {
      id: "company-duty",
      title: "회사의 의무",
      parts: [
        {
          kind: "ol",
          items: [
            "회사는 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며, 지속적이고 안정적으로 서비스를 제공하기 위하여 노력합니다.",
            "회사는 이용자가 안전하게 서비스를 이용할 수 있도록 개인정보 보호를 위한 보안 시스템을 갖춥니다.",
            ...(f.paid ? ["회사는 상품이나 용역에 대하여 「표시·광고의 공정화에 관한 법률」 제3조에서 정한 부당한 표시·광고 행위를 하여 이용자가 손해를 입은 경우 이를 배상할 책임을 집니다."] : []),
            "회사는 이용자가 원하지 않는 영리 목적의 광고성 전자우편이나 문자를 보내지 않습니다.",
          ],
        },
      ],
    },
    ...(f.membership
      ? [
          {
            id: "account",
            title: "회원의 아이디 및 비밀번호 관리",
            parts: [
              {
                kind: "ol" as const,
                items: [
                  "아이디와 비밀번호에 관한 관리 책임은 회원에게 있습니다.",
                  "회원은 자신의 아이디와 비밀번호를 제3자가 이용하게 해서는 안 됩니다.",
                  "회원이 자신의 아이디와 비밀번호를 도난당하거나 제3자가 사용하고 있음을 안 경우에는 바로 회사에 알리고 회사의 안내가 있으면 그에 따라야 합니다.",
                ],
              },
            ],
          },
        ]
      : []),
    {
      id: "user-duty",
      title: "이용자의 의무",
      parts: [
        { kind: "p", text: "이용자는 다음 행위를 해서는 안 됩니다." },
        {
          kind: "ul",
          items: [
            "신청 또는 변경 시 허위 내용을 등록하는 행위",
            "다른 사람의 정보를 도용하는 행위",
            "사이트에 게시된 정보를 회사의 허락 없이 변경하는 행위",
            "회사가 정한 정보 외의 정보(컴퓨터 프로그램 등)를 보내거나 게시하는 행위",
            "회사와 제3자의 저작권 등 지식재산권을 침해하는 행위",
            "회사와 제3자의 명예를 손상하거나 업무를 방해하는 행위",
            "외설 또는 폭력적인 메시지, 화상, 음성 그 밖에 공서양속에 반하는 정보를 사이트에 공개 또는 게시하는 행위",
          ],
        },
      ],
    },
    ...(f.posts
      ? [
          {
            id: "posts",
            title: "게시물의 관리",
            parts: [
              {
                kind: "ol" as const,
                items: [
                  "게시물에 대한 권리와 책임은 게시한 이용자에게 있습니다.",
                  {
                    text: "회사는 이용자의 게시물이 다음에 해당하는 경우 사전 통지 없이 삭제하거나 게시를 중단할 수 있습니다.",
                    sub: [
                  "다른 이용자 또는 제3자를 비방하거나 명예를 손상하는 내용",
                  "공서양속에 위반되는 내용이거나 범죄 행위와 관련된 내용",
                  "제3자의 저작권 등 권리를 침해하는 내용",
                  "광고, 홍보 목적의 반복 게시물 등 서비스 운영을 방해하는 내용",
                    ],
                  },
                  "자신의 권리가 침해되었다고 주장하는 사람은 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 회사에 게시물의 삭제 등을 요청할 수 있으며, 회사는 관련 법령에 따라 조치합니다.",
                ],
              },
            ],
          },
        ]
      : []),
    {
      id: "copyright",
      title: "저작권의 귀속 및 이용 제한",
      parts: [
        {
          kind: "ol",
          items: [
            "회사가 작성한 저작물에 대한 저작권과 그 밖의 지식재산권은 회사에 귀속합니다.",
            "이용자는 사이트를 이용하여 얻은 정보 중 회사에 지식재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 등 그 밖의 방법으로 영리 목적에 이용하거나 제3자에게 이용하게 해서는 안 됩니다.",
            ...(f.posts ? ["이용자가 작성한 게시물의 저작권은 해당 이용자에게 있으며, 회사는 서비스 운영과 홍보를 위하여 필요한 범위에서 이용자의 게시물을 사이트 안에 노출할 수 있습니다."] : []),
          ],
        },
      ],
    },
    {
      id: "dispute",
      title: "분쟁 해결",
      parts: [
        {
          kind: "ol",
          items: [
            `회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상 처리하기 위하여 고객 상담 창구(${blank(f.contact, "고객 상담 연락처")})를 운영합니다.`,
            "회사는 이용자가 제출하는 불만 사항과 의견을 우선적으로 처리하며, 신속한 처리가 곤란한 경우에는 그 사유와 처리 일정을 바로 알려 드립니다.",
            ...(f.paid ? ["회사와 이용자 간에 발생한 전자상거래 분쟁과 관련하여 이용자의 피해구제 신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다."] : []),
          ],
        },
      ],
    },
    {
      id: "court",
      title: "재판권 및 준거법",
      parts: [
        {
          kind: "ol",
          items: [
            f.court === "이용자 주소지 관할 지방법원"
              ? "회사와 이용자 간에 발생한 분쟁에 관한 소송은 제소 당시 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만 제소 당시 이용자의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다."
              : "회사와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법에 따른 관할 법원에 제기합니다.",
            "회사와 이용자 간에 제기된 소송에는 대한민국 법을 적용합니다.",
          ],
        },
      ],
    },
  );

  // 부칙은 조 번호를 붙이지 않는다
  sections.push({ id: "addenda", title: "", parts: [{ kind: "p", text: `부칙\n이 약관은 ${fixDate}부터 시행합니다.` }] });
  return sections;
}

const itemText = (t: Item) => (typeof t === "string" ? t : t.text);
const itemSub = (t: Item) => (typeof t === "string" ? [] : t.sub);
const mark = (i: number) => CIRCLED[i] ?? `${i + 1}.`;

const partText = (p: Part) =>
  p.kind === "p"
    ? p.text
    : p.kind === "ol"
      ? p.items.map((t, i) => [`${mark(i)} ${itemText(t)}`, ...itemSub(t).map((x, j) => `  ${j + 1}. ${x}`)].join("\n")).join("\n")
      : p.items.map((t) => `- ${t}`).join("\n");

// 복사·다운로드용 일반 텍스트
function toText(sections: Section[]) {
  let n = 0;
  return sections
    .map((s) => (s.title ? `제${++n}조 (${s.title})\n` : "") + s.parts.map(partText).join("\n"))
    .join("\n\n");
}

function toHtml(sections: Section[]) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  let n = 0;
  return sections
    .map((s) => {
      const head = s.title ? `<h3>제${++n}조 (${esc(s.title)})</h3>\n` : "";
      const body = s.parts
        .map((p) =>
          p.kind === "p"
            ? `<p>${esc(p.text)}</p>`
            : p.kind === "ol"
              ? `<ol style="list-style:none;padding-left:0">${p.items
                  .map((t, i) => `<li>${mark(i)} ${esc(itemText(t))}${itemSub(t).length ? `<ol>${itemSub(t).map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}</li>`)
                  .join("")}</ol>`
              : `<ul>${p.items.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`,
        )
        .join("\n");
      return head + body;
    })
    .join("\n");
}

// 빈 필수값 "[회사명]"을 빨간 표시로 보여 준다
function Marked({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((t, i) =>
        /^\[.+\]$/.test(t) ? (
          <mark key={i} className="rounded bg-[#fde7e9] px-1 font-bold text-[#b42318]">
            {t}
          </mark>
        ) : (
          t
        ),
      )}
    </>
  );
}

const label = "block text-[15px] font-bold";
const input = "mt-1.5 h-11 w-full rounded-md border border-[#6d7882] bg-white px-3 text-[16px]";
const chip = (on: boolean) =>
  `min-h-12 rounded-md border px-3 py-2 text-left text-[15px] font-bold transition-colors ${on ? "border-accent bg-accent-surface text-accent-hover" : "border-border hover:bg-surface"}`;

export function TermsGenerator() {
  const reduce = useReducedMotionSafe();
  const [form, setForm] = useLocalStorage<Form>(STORAGE_KEY, initialForm);
  const [copied, setCopied] = useState<"text" | "html" | null>(null);
  // 처음 불러올 때는 모든 조항이 번쩍이지 않도록, 저장값을 읽은 뒤부터 강조한다
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, []);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const sections = useMemo(() => build(form), [form]);
  const required: [string, boolean][] = [
    ["회사명", !!form.company.trim()],
    ["사이트 이름", !!form.siteName.trim()],
    ["고객 상담 연락처", !!form.contact.trim()],
    ["시행일", !!form.effectiveDate],
  ];
  const done = required.filter(([, ok]) => ok).length;

  const copy = async (kind: "text" | "html") => {
    const value = kind === "text" ? toText(sections) : toHtml(sections);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([toText(sections)], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `이용약관_${form.company.trim() || "초안"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let count = 0;
  const numbers = sections.map((s) => (s.title ? ++count : 0));

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <form className="min-w-0" onSubmit={(e) => e.preventDefault()} aria-label="이용약관 항목 입력">
        <fieldset>
          <legend className={label}>사이트 유형</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SITE_TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={form.siteType === t} onClick={() => setForm((f) => ({ ...f, siteType: t, ...PRESETS[t] }))} className={chip(form.siteType === t)}>
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className={label}>
            회사·상호명 <span className="text-[#b42318]">*</span>
            <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="예: 곰파트너상회" className={input} />
          </label>
          <label className={label}>
            사이트 이름 <span className="text-[#b42318]">*</span>
            <input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="예: 곰파트너몰" className={input} />
          </label>
          <label className={label}>
            사이트 주소
            <input value={form.siteUrl} onChange={(e) => set("siteUrl", e.target.value)} inputMode="url" placeholder="https://www.gompartner.co.kr" className={input} />
          </label>
          <label className={label}>
            고객 상담 연락처 <span className="text-[#b42318]">*</span>
            <input value={form.contact} onChange={(e) => set("contact", e.target.value)} placeholder="02-000-0000, help@gompartner.co.kr" className={input} />
          </label>
        </div>

        <fieldset className="mt-6 grid gap-2">
          <legend className={label}>운영 방식</legend>
          {(
            [
              ["membership", "회원가입을 받습니다"],
              ["paid", "유료 상품이나 서비스를 판매하고 결제를 받습니다"],
              ["posts", "이용자가 글이나 후기를 올릴 수 있습니다"],
            ] as const
          ).map(([k, text]) => (
            <label key={k} className="inline-flex items-center gap-2 text-[16px]">
              <input type="checkbox" checked={form[k]} onChange={(e) => set(k, e.target.checked)} className="size-4 accent-[var(--accent)]" />
              {text}
            </label>
          ))}
        </fieldset>

        <AnimatePresence initial={false}>
          {form.paid && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0.12 : 0.22, ease: EASE }}
              className="overflow-hidden"
            >
              <fieldset className="mt-6">
                <legend className={label}>판매하는 것</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {GOODS.map((g) => (
                    <button key={g} type="button" aria-pressed={form.goods === g} onClick={() => set("goods", g)} className={chip(form.goods === g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className={`${label} mt-6`}>
                청약철회(환불 요청) 기간
                <select value={form.withdrawDays} onChange={(e) => set("withdrawDays", Number(e.target.value))} className={input}>
                  <option value={7}>7일 (법정 최소 기간)</option>
                  <option value={14}>14일</option>
                  <option value={30}>30일</option>
                </select>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <fieldset className="mt-6">
          <legend className={label}>소송 관할 법원</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {COURTS.map((c) => (
              <button key={c} type="button" aria-pressed={form.court === c} onClick={() => set("court", c)} className={chip(form.court === c)}>
                {c}
                {c === COURTS[0] && <span className="block text-[14px] font-normal text-foreground-secondary">표준약관 방식</span>}
              </button>
            ))}
          </div>
        </fieldset>

        <label className={`${label} mt-6`}>
          시행일 <span className="text-[#b42318]">*</span>
          <div className="mt-1.5 flex gap-2">
            <input type="date" value={form.effectiveDate} onChange={(e) => set("effectiveDate", e.target.value)} className={input.replace("mt-1.5 ", "")} />
            <button type="button" onClick={() => set("effectiveDate", today())} className="h-11 shrink-0 rounded-md border border-border px-3 text-[15px] font-bold hover:bg-surface">
              오늘
            </button>
          </div>
        </label>

        <button type="button" onClick={() => setForm(initialForm)} className="mt-6 text-[15px] text-foreground-secondary underline underline-offset-4">
          입력 내용 모두 지우기
        </button>
      </form>

      <section aria-labelledby="preview-title" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[10px] border border-border">
          <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
            <h2 id="preview-title" className="mr-auto text-[17px] font-bold">
              미리보기
              <span className="ml-2 text-[15px] font-normal text-foreground-secondary">
                필수 입력 {done}/{required.length}, {count}개 조항
              </span>
            </h2>
            <button type="button" onClick={() => copy("text")} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-3.5 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied === "text" ? "ok" : "copy"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15, ease: EASE }}
                  className="inline-flex"
                >
                  {copied === "text" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
                </motion.span>
              </AnimatePresence>
              {copied === "text" ? "복사했습니다" : "글자로 복사"}
            </button>
            <button type="button" onClick={() => copy("html")} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-[#6d7882] px-3.5 text-[15px] font-bold hover:bg-surface">
              {copied === "html" ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
              {copied === "html" ? "복사했습니다" : "HTML 복사"}
            </button>
            <button type="button" onClick={download} aria-label="텍스트 파일로 내려받기" className="grid size-10 place-items-center rounded-md border border-[#6d7882] hover:bg-surface">
              <Download size={16} aria-hidden />
            </button>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary" aria-hidden>
              <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${(done / required.length) * 100}%` }} transition={{ duration: reduce ? 0 : 0.3, ease: EASE }} />
            </div>
          </div>
          <article className="max-h-[70vh] overflow-auto p-5 text-[15px] leading-[1.7] md:p-6" aria-live="off">
            <h3 className="text-[19px] font-bold">{form.siteName.trim() ? `${form.siteName.trim()} 이용약관` : "이용약관"}</h3>
            {sections.map((s, si) => (
              <div key={s.id} className="relative mt-4">
                {/* 내용이 바뀐 조항만 잠깐 노랗게 표시한다 */}
                {ready && !reduce && (
                  <motion.span
                    key={JSON.stringify(s.parts)}
                    aria-hidden
                    className="pointer-events-none absolute -inset-x-2 -inset-y-1 rounded bg-[#fff4ce]"
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
                  />
                )}
                <div className="relative">
                  {s.title && (
                    <h4 className="font-bold">
                      제{numbers[si]}조 ({s.title})
                    </h4>
                  )}
                  {s.parts.map((p, i) =>
                    p.kind === "p" ? (
                      <p key={i} className="mt-1 whitespace-pre-line">
                        <Marked text={p.text} />
                      </p>
                    ) : p.kind === "ol" ? (
                      <ol key={i} className="mt-1 grid gap-0.5">
                        {p.items.map((it, j) => (
                          <li key={itemText(it)} className="grid grid-cols-[1.4em_1fr]">
                            <span aria-hidden>{mark(j)}</span>
                            <span>
                              <Marked text={itemText(it)} />
                              {itemSub(it).length > 0 && (
                                <ol className="mt-0.5 list-decimal pl-5">
                                  {itemSub(it).map((x) => (
                                    <li key={x}>
                                      <Marked text={x} />
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <ul key={i} className="mt-1 list-disc pl-10">
                        {p.items.map((it) => (
                          <li key={it}>
                            <Marked text={it} />
                          </li>
                        ))}
                      </ul>
                    ),
                  )}
                </div>
              </div>
            ))}
          </article>
        </div>
        <p className="mt-3 text-[14px] leading-[1.6] text-foreground-secondary">
          공정거래위원회 표준약관 구성을 따른 초안이며 법률 자문을 대신하지 않습니다.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-surface p-5">
          <p className="text-[16px] font-bold">약관을 홈페이지 회원가입 화면에 붙여야 하나요?</p>
          <ChannelTalkButton cta="tool_terms_chat" className="inline-flex h-11 items-center rounded-md bg-accent px-4 text-[15px] font-bold text-accent-foreground hover:bg-accent-hover">
            채팅 상담
          </ChannelTalkButton>
        </div>
      </section>
    </div>
  );
}
