"use client";

import React from "react";
import { ArrowLeft, Network, Building2, GraduationCap, Users2, ShieldAlert } from "lucide-react";

/**
 * 울산과학대학교 산학협력단 통합 성과관리 대시보드 - 조직·사업 맵 컴포넌트
 * 
 * 첫 번째 이미지에서 제시된 산학협력단 조직도를 HTML 구조와 CSS flexbox/grid를 활용하여
 * 미려한 카드 및 커넥터 라인(연결선)으로 구현합니다.
 * 
 * 각 등급별(단장/부단장/본부장, 대분류, 센터/사업단)로 색상을 차별화하여 시인성을 높였습니다:
 * - 최상위/리더 (주황색 테두리): 단장, 부단장, 본부장
 * - 1차 하위 조직 (초록색 테두리): 학교기업, 연구소, 부속기관, 사업기구 등
 * - 2차 하위 조직 (파란색 테두리): 각 센터 및 일반 사업단
 * - 보라색 병렬 조직 (보라색 테두리): 어린이급식관리사업단 산하 급식센터들
 * - 국책사업단 목록 (청록색 테두리): 개별 국책사업단
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
          <p>울산과학대학교 산학협력단의 세부 조직 및 운영 중인 국책사업단의 전체 계층 구조입니다.</p>
        </div>
      </section>

      {/* 조직도 스크롤 및 차트 영역 */}
      <div className="org-chart-scroll-wrapper">
        <div className="org-chart-inner">
          
          {/* [1단계] 최상위 레벨: 산학협력단장 */}
          <div className="org-level root-level">
            <div className="org-node leader-node orange-border">
              <span className="node-badge orange-badge">최상위</span>
              <h4>산학협력단장</h4>
              <p className="node-sub">대표 의사결정권자</p>
            </div>
          </div>

          {/* 수직 연결선 */}
          <div className="connector-vertical-main"></div>

          {/* [2단계] 중간 리더 레벨: 부단장 및 본부장 (가로 2열 배치) */}
          <div className="org-level-2-container">
            <div className="horizontal-connector-l2"></div>
            
            <div className="org-level-2-row">
              
              {/* 왼쪽 트리: 산학협력부단장 산하 지부 */}
              <div className="org-branch-column">
                <div className="connector-to-parent"></div>
                <div className="org-node leader-node orange-border">
                  <span className="node-badge orange-badge">리더</span>
                  <h4>산학협력부단장</h4>
                  <p className="node-sub">내부 조직 및 연구 관리</p>
                </div>
                
                <div className="connector-vertical-sub"></div>
                
                {/* [3단계] 부단장 산하 5개 대분류 카테고리 (가로 배치) */}
                <div className="org-level-3-container">
                  <div className="horizontal-connector-l3-left"></div>
                  
                  <div className="org-level-3-row">
                    
                    {/* 1. 학교기업 트리 */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border" id="node-school-biz">
                        <span className="node-badge green-badge">대분류</span>
                        <h4>학교기업</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      {/* 학교기업 산하 체인 구조 */}
                      <div className="chain-wrapper">
                        <div className="org-node center-node blue-border">
                          <h5>종합환경분석센터</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>영상컨텐츠제작센터</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>스포츠재활운동센터</h5>
                        </div>
                      </div>
                    </div>

                    {/* 2. 연구소 트리 */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border" id="node-research-inst">
                        {/* 부속기관 -> 연구소 -> 학교기업 가로 화살표 연결 흐름 */}
                        <div className="flow-arrow-to-left" title="학교기업 방향 흐름">
                          <ArrowLeft size={14} />
                        </div>
                        <span className="node-badge green-badge">대분류</span>
                        <h4>연구소</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      {/* 연구소 산하 체인 구조 */}
                      <div className="chain-wrapper">
                        <div className="org-node center-node blue-border">
                          <h5>지역혁신연구소</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>이차전지연구소</h5>
                        </div>
                      </div>
                    </div>

                    {/* 3. 부속기관 트리 */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border" id="node-sub-org">
                        <div className="flow-arrow-to-left" title="연구소 방향 흐름">
                          <ArrowLeft size={14} />
                        </div>
                        <span className="node-badge green-badge">대분류</span>
                        <h4>부속기관</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      {/* 부속기관 산하 체인 구조 */}
                      <div className="chain-wrapper">
                        <div className="org-node center-node blue-border">
                          <h5>현장실습지원센터</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>창업창직교육센터</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>울산광역시탄소중립지원센터</h5>
                        </div>
                      </div>
                    </div>

                    {/* 4. 산학기획팀 (체인 없음) */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border">
                        <span className="node-badge green-badge">지원부서</span>
                        <h4>산학기획팀</h4>
                      </div>
                    </div>

                    {/* 5. 산학지원팀 (체인 없음) */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border">
                        <span className="node-badge green-badge">지원부서</span>
                        <h4>산학지원팀</h4>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              {/* 오른쪽 트리: 기업인재교육본부장 산하 지부 */}
              <div className="org-branch-column">
                <div className="connector-to-parent"></div>
                <div className="org-node leader-node orange-border">
                  <span className="node-badge orange-badge">리더</span>
                  <h4>기업인재교육본부장</h4>
                  <p className="node-sub">교육본부 및 국책사업 총괄</p>
                </div>
                
                <div className="connector-vertical-sub"></div>
                
                {/* [3단계] 본부장 산하 3개 대분류 카테고리 (가로 배치) */}
                <div className="org-level-3-container">
                  <div className="horizontal-connector-l3-right"></div>
                  
                  <div className="org-level-3-row">
                    
                    {/* 1. 사업기구 트리 */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border">
                        <span className="node-badge green-badge">대분류</span>
                        <h4>사업기구</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      {/* 사업기구 산하 특수 결합 구조 */}
                      <div className="chain-wrapper">
                        <div className="org-node center-node blue-border">
                          <h5>어린이급식관리사업단</h5>
                        </div>
                        
                        <div className="connector-vertical-leaf"></div>
                        
                        {/* 급식지원센터 3개 병렬 목록 (보라색 테두리) */}
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
                        
                        <div className="connector-vertical-leaf"></div>
                        
                        <div className="org-node center-node blue-border">
                          <h5>간호시뮬레이션센터</h5>
                        </div>
                      </div>
                    </div>

                    {/* 2. 기업인재교육본부 트리 */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border">
                        <span className="node-badge green-badge">대분류</span>
                        <h4>기업인재교육본부</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      <div className="chain-wrapper">
                        <div className="org-node center-node blue-border">
                          <h5>일학습병행제사업단</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>고교단계통합공동훈련센터</h5>
                        </div>
                        <div className="connector-vertical-leaf"></div>
                        <div className="org-node center-node blue-border">
                          <h5>지역산업맞춤형인력양성사업단</h5>
                        </div>
                      </div>
                    </div>

                    {/* 3. 국책사업단 트리 (8개 사업단 세로 리스트) */}
                    <div className="org-leaf-column">
                      <div className="connector-to-parent-l3"></div>
                      <div className="org-node dept-node green-border">
                        <span className="node-badge green-badge">대분류</span>
                        <h4>국책사업단</h4>
                      </div>
                      
                      <div className="connector-vertical-leaf"></div>
                      
                      {/* 8개 국책사업단이 세로로 나열된 리스트 컨테이너 */}
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
