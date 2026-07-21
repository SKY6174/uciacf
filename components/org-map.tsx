"use client";

import React from "react";
import { ArrowLeft, Network } from "lucide-react";

/**
 * 울산과학대학교 산학협력단 통합 성과관리 대시보드 - 조직·사업 맵 컴포넌트
 * 
 * 사용자 피드백을 기반으로 아래 변경 사항을 정밀 반영하였습니다:
 * 1. 동구/남구/북구 어린이∙사회복지급식센터 카드의 높이를 50% 슬림하게 다이어트.
 * 2. 기업인재교육본부장은 기업인재교육본부만 전담하도록 사업기구를 부단장 산하로 이동.
 * 3. 산학협력부단장 노드가 산학협력단장 노드 바로 밑에 정중앙 수직 일렬로 배치되는 메인 스트림 구조로 개편.
 * 4. 국책사업단 및 본부장 지부는 단장-부단장 수직 기둥의 우측 분기교량선(Dashed 포함)을 통해 뻗어가도록 수정.
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
          <p>울산과학대학교 산학협력단의 세부 조직 및 운영 중인 국책사업단의 계층 구조입니다. (부단장 수직 일렬 매칭 완료)</p>
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

            {/* 단장 노드에서 바로 부단장으로 수직 하강하는 메인 스트림 직선 공간 */}
            <div className="org-l1-l2-direct-line"></div>

            {/* [2단계 레이아웃 개편] 부단장 수직 기둥(좌) & 우측 분기(우) 결합 컨테이너 */}
            <div className="org-l2-flex-container">
              
              {/* 왼쪽: 메인 스트림 - 산학협력부단장 지부 (단장 바로 아래에 수직 1:1 정렬됨) */}
              <div className="org-l2-main-col">
                <div className="org-node leader-node orange-border">
                  <span className="node-badge orange-badge">리더</span>
                  <h4>산학협력부단장</h4>
                  <p className="node-sub">내부 조직 및 연구 관리</p>
                </div>

                {/* [3단계 자식들] 부단장 산하 6개 대분류 (사업기구 포함) */}
                <div className="org-children-row">
                  <div className="org-parent-connector"></div>

                  {/* 1) 학교기업 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>학교기업</h4>
                    </div>

                    {/* 수직 목록 구조 (카드 사이 수직선 제거) */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>종합환경분석센터</h5>
                      </div>
                      <div className="org-node center-node blue-border">
                        <h5>영상컨텐츠제작센터</h5>
                      </div>
                      <div className="org-node center-node blue-border">
                        <h5>스포츠재활운동센터</h5>
                      </div>
                    </div>
                  </div>

                  {/* 2) 연구소 */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <div className="flow-arrow-to-left" title="학교기업 방향 흐름">
                        <ArrowLeft size={13} />
                      </div>
                      <span className="node-badge green-badge">대분류</span>
                      <h4>연구소</h4>
                    </div>

                    {/* 수직 목록 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>지역혁신연구소</h5>
                      </div>
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

                    {/* 수직 목록 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>현장실습지원센터</h5>
                      </div>
                      <div className="org-node center-node blue-border">
                        <h5>창업창직교육센터</h5>
                      </div>
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

                  {/* 6) 사업기구 (본부장에서 부단장 산하로 소속 이동 완료) */}
                  <div className="org-child-col">
                    <div className="org-node dept-node green-border">
                      <span className="node-badge green-badge">대분류</span>
                      <h4>사업기구</h4>
                    </div>

                    {/* 수직 목록 구조 */}
                    <div className="org-chain-row">
                      <div className="org-chain-connector"></div>
                      <div className="org-node center-node blue-border">
                        <h5>어린이급식관리사업단</h5>
                      </div>
                      
                      {/* 병렬 급식지원센터 목록 (보라색 점선 상자) */}
                      <div className="parallel-list-container">
                        <div className="parallel-list-node violet-border">
                          <h6>동구<br />어린이∙사회복지급식센터</h6>
                        </div>
                        <div className="parallel-list-node violet-border">
                          <h6>남구<br />어린이∙사회복지급식센터</h6>
                        </div>
                        <div className="parallel-list-node violet-border">
                          <h6>북구<br />어린이∙사회복지급식센터</h6>
                        </div>
                      </div>

                      <div className="org-node center-node blue-border">
                        <h5>간호시뮬레이션센터</h5>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 오른쪽: 서브 스트림 - 기업인재교육본부장 & 국책사업단 분기 영역 */}
              <div className="org-l2-right-stream">
                
                {/* 단장-부단장 중심선에서 우측으로 꺾여 나가는 수평 교량 브릿지선 */}
                <div className="org-l2-horizontal-bridge"></div>

                <div className="org-l2-right-cols-wrapper">
                  
                  {/* [우측 열 1] 기업인재교육본부장 (기업인재교육본부만 전담) */}
                  <div className="org-l2-right-branch-col">
                    <div className="org-node leader-node orange-border">
                      <span className="node-badge orange-badge">리더</span>
                      <h4>기업인재교육본부장</h4>
                      <p className="node-sub">교육본부 전담</p>
                    </div>

                    {/* 본부장 아래에는 기업인재교육본부 1개 노드만 1:1 직통 수직 결합 */}
                    <div className="org-children-row">
                      <div className="org-parent-connector"></div>
                      <div className="org-child-col">
                        <div className="org-node dept-node green-border">
                          <span className="node-badge green-badge">대분류</span>
                          <h4>기업인재교육본부</h4>
                        </div>

                        {/* 수직 목록 구조 */}
                        <div className="org-chain-row">
                          <div className="org-chain-connector"></div>
                          <div className="org-node center-node blue-border">
                            <h5>일학습병행제사업단</h5>
                          </div>
                          <div className="org-node center-node blue-border">
                            <h5>고교단계통합공동훈련센터</h5>
                          </div>
                          <div className="org-node center-node blue-border">
                            <h5>지역산업맞춤형인력양성사업단</h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* [우측 열 2] 국책사업단 (단장 직속 및 점선 브랜치) */}
                  <div className="org-l2-right-branch-col dashed-branch-r">
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
