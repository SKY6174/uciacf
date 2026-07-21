"use client";

import React from "react";
import { ArrowLeft, Network } from "lucide-react";

/**
 * 울산과학대학교 산학협력단 통합 성과관리 대시보드 - 조직·사업 맵 컴포넌트
 * 
 * 직선 커넥터가 픽셀 단위로 카드의 정확한 중앙에 밀착되도록 마크업을 표준 트리 노드 구조로 개정했습니다.
 * 이 구조는 CSS 가상 요소를 이용해 가로/세로 연결선이 자동 정렬 및 결합되어 절대 끊어지지 않도록 설계되었습니다.
 * 
 * [계층 정의]
 * 1. 최상위(단장) -> `org-tree-wrapper` 아래 첫 번째 노드
 * 2. 2단계(부단장 / 본부장) -> `org-children-row` 내의 `org-child-col` 2개 열
 * 3. 3단계(대분류 부서) -> 각 리더 노드 하위의 `org-children-row` 및 `org-child-col`들
 * 4. 체인 구조(센터 및 일반 사업단) -> 각 대분류 노드 아래의 세로 체인(`org-chain-row`)
 */
export function OrgMap() {
  return (
    <div className="org-map-container">
      {/* 페이지 헤더 영역 */}
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <Network size={12} aria-hidden="true" />
            <span>ORGANIZATION & PROGRAM MAP</span>
          </div>
          <h1>조직·사업 맵</h1>
          <p>울산과학대학교 산학협력단의 세부 조직 및 운영 중인 국책사업단의 계층 구조입니다. (연결선 정렬 완료)</p>
        </div>
      </section>

      {/* 조직도 스크롤 컨테이너 */}
      <div className="org-chart-scroll-wrapper">
        <div className="org-chart-inner">
          
          {/* 전체 트리를 감싸는 루트 컨테이너 */}
          <div className="org-tree-wrapper">
            
            {/* [1단계] 최상위 레벨: 산학협력단장 */}
            <div className="org-tree-node-wrapper">
              <div className="org-node leader-node orange-border">
                <span className="node-badge orange-badge">최상위</span>
                <h4>산학협력단장</h4>
                <p className="node-sub">대표 의사결정권자</p>
              </div>
            </div>

            {/* [2단계 자식들] 부단장, 본부장 세트 */}
            <div className="org-children-row">
              {/* 단장 바로 밑으로 내려오는 부모용 수직선 */}
              <div className="org-parent-connector"></div>

              {/* 자식 1: 산학협력부단장 지부 */}
              <div className="org-child-col">
                <div className="org-node leader-node orange-border">
                  <span className="node-badge orange-badge">리더</span>
                  <h4>산학협력부단장</h4>
                  <p className="node-sub">내부 조직 및 연구 관리</p>
                </div>

                {/* [3단계 자식들] 부단장 산하 5개 대분류 */}
                <div className="org-children-row">
                  <div className="org-parent-connector"></div>

                  {/* 1) 학교기업 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>학교기업</h4>
                    </div>

                    {/* 수직 체인 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>종합환경분석센터</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>영상컨텐츠제작센터</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>스포츠재활운동센터</h5>
                      </div>
                    </div>
                  </div>

                  {/* 2) 연구소 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      {/* 가로 흐름 화살표 지시자 */}
                      <div className="flow-arrow-to-left" title="학교기업 방향 흐름">
                        <ArrowLeft size={13} />
                      </div>
                      <span className="node-badge green-badge">대분류</span>
                      <h4>연구소</h4>
                    </div>

                    {/* 수직 체인 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>지역혁신연구소</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>이차전지연구소</h5>
                      </div>
                    </div>
                  </div>

                  {/* 3) 부속기관 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <div className="flow-arrow-to-left" title="연구소 방향 흐름">
                        <ArrowLeft size={13} />
                      </div>
                      <span className="node-badge green-badge">대분류</span>
                      <h4>부속기관</h4>
                    </div>

                    {/* 수직 체인 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>현장실습지원센터</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>창업창직교육센터</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>울산광역시탄소중립지원센터</h5>
                      </div>
                    </div>
                  </div>

                  {/* 4) 산학기획팀 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">지원부서</span>
                      <h4>산학기획팀</h4>
                    </div>
                  </div>

                  {/* 5) 산학지원팀 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">지원부서</span>
                      <h4>산학지원팀</h4>
                    </div>
                  </div>

                </div>
              </div>

              {/* 자식 2: 기업인재교육본부장 지부 */}
              <div className="org-child-col">
                <div className="org-node leader-node orange-border">
                  <span className="node-badge orange-badge">리더</span>
                  <h4>기업인재교육본부장</h4>
                  <p className="node-sub">교육본부 및 국책사업 총괄</p>
                </div>

                {/* [3단계 자식들] 본부장 산하 3개 대분류 */}
                <div className="org-children-row">
                  <div className="org-parent-connector"></div>

                  {/* 1) 사업기구 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>사업기구</h4>
                    </div>

                    {/* 수직 체인 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>어린이급식관리사업단</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      
                      {/* 병렬 급식지원센터 목록 (보라색 점선 상자) */}
                      <div className="parallel-list-container">
                        <div className="parallel-list-node violet-border">
                          <h6>동구어린이·사회복지급식센터</h6>
                        </div>
                        <div className="parallel-list-node violet-border">
                          <h6>남구어린이·사회복지급식센터</h6>
                        </div>
                        <div className="parallel-list-node violet-border">
                          <h6>북구어린이·사회복지급식센터</h6>
                        </div>
                      </div>

                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>간호시뮬레이션센터</h5>
                      </div>
                    </div>
                  </div>

                  {/* 2) 기업인재교육본부 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>기업인재교육본부</h4>
                    </div>

                    {/* 수직 체인 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>일학습병행제사업단</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>고교단계통합공동훈련센터</h5>
                      </div>
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>지역산업맞춤형인력양성사업단</h5>
                      </div>
                    </div>
                  </div>

                  {/* 3) 국책사업단 (8개 사업단 세로 리스트) */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>국책사업단</h4>
                    </div>

                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      
                      {/* 8개 국책사업단 세로 목록 박스 */}
                      <div className="vertical-project-list">
                        <div className="project-list-node teal-border">
                          <span>차세대통신혁신융합대학사업단(NCCOSS)</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>첨단산업인재양성부트캠프사업단</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>기술사관육성사업단</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>창업교육혁신사업단(SCOUT)</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>육아교육보육혁신사업단</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>전문대학혁신지원사업단</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>AID전환중점전문대학지원사업단</span>
                        </div>
                        <div className="project-list-node teal-border">
                          <span>RISE사업단</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
