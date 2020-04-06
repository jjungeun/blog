import React from "react"
import { graphql, StaticQuery } from "gatsby"
// import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Bio from "../components/bio"

import "../utils/normalize.css"
import "../utils/css/screen.css"

const AboutPage = ({ data }, location) => {
  const siteTitle = data.site.siteMetadata.title
  const subStyle = {
    paddingLeft: 30,
  }
  return (
    <Layout title={siteTitle}>
      <SEO title="ABout" keywords={[`blog`, `gatsby`, `javascript`, `react`]} />
      <article className="post-content page-template no-image">
        <div className="post-content-body">
          <Bio />
          <h3 id="dynamic-styles">portfolio</h3>
          <h5>2020</h5>
          <p>
            <li>서울42 참여</li>
          </p>
          <p>
            <li>캡스톤 프로젝트</li>
          </p>
          <p>
            <li>논문 or 인턴</li>
          </p>
          <h5>2019</h5>
          <p>
            <li>
              동아리 <a href="https://github.com/chohanjoo/SODASITE">사이트</a>{" "}
              제작 및 배포
            </li>
            <div style={subStyle}>Django, Docker, Aws</div>
          </p>
          <p>
            <li>
              교내 실습환경 및 프로젝트 환경 구성을 위한 Openstack 프로젝트
            </li>
            <div style={subStyle}>Django로 Dashboard부분 커스터마이징</div>
          </p>
          <p>
            <li>회사 학부연구생, 인턴</li>
            <div style={subStyle}>
              데이터 분석을 위한 책 집필(위키북스) - 파이썬언어 부분과 데이터
              전처리 부분
              <br />
              학습할 데이터 마이닝(크롤링)과 전처리, MySQL DB
              <br />
              데이터 분석과 학습을 위한 엘라스틱 서치 멀티노드 환경 구성
              <br />
              React와 Firebase로 총선관련하여 데이터분석한 결과를 보여줄
              데모페이지 개발
              <br />
            </div>
          </p>
          <p>
            <li>
              <a href="https://github.com/soda-infra">Aladin</a>
            </li>
            <div style={subStyle}>
              오픈소스인 kiali 커스터마이징하여 쿠버네티스 기반의 마이크로서비스
              클러스터 모니터링 서비스개발
              <br />
              기존엔 네트워크 모니터링만 되었지만 각 노드의 인프라 관련
              정보(pod별 cpu사용율, 메모리 사용율 등)를 추가함
              <br />
              React, Typescript, Go
              <br />
            </div>
          </p>
          <p>
            <li>개인 프로젝트로 JS와 React공부</li>
            <div style={subStyle}>
              <a href="https://github.com/jjungeun/todolist">Todolist</a>
              <br />
              <a href="https://github.com/jjungeun/webpage">Webpage</a>
              <br />
              <a href="https://github.com/jjungeun/blog">blog</a>
              <br />
            </div>
          </p>
          <h5>2018</h5>
          <p>
            <li>
              객체지향 공부를 위한 Round-Trip Engineering기반의 UML, 소스코드
              컨버터
            </li>
            <div style={subStyle}>Java로 파싱하는 부분</div>
          </p>
          <p>
            <li>IOT기반의 따릉이 헬멧관리 모니터링 서비스</li>
            <div style={subStyle}>SpringBoot 백엔드</div>
          </p>
          <p>
            <li>클립보드와 Google Vision API기반 일정 등록 자동화 서비스</li>
            <div style={subStyle}>안드로이드와 Google Vision API부분</div>
          </p>
        </div>
      </article>
    </Layout>
  )
}

const indexQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default props => (
  <StaticQuery
    query={indexQuery}
    render={data => (
      <AboutPage location={props.location} data={data} {...props} />
    )}
  />
)
