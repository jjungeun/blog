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
            <li>
              <a href="http://github.com/kuberkuber">쿠버쿠버</a>
            </li>
            <div style={subStyle}>
              쿠버네티스를 이용한 웹 기반의 오픈소스 자동배포 및 테스트 프로젝트
              <br />
              AWS, Terraform, Node.js, Express, React, TypeScript
              <br />
              AWS 쿠버네티스 인프라 환경 구성
              <br />
              쿠버네티스 API를 사용하여 웹 기반 배포 파이프라인 구축
              <br />
              한국 컴퓨터 정보학회에 프로젝트 관련 논문 투고
            </div>
          </p>
          <p>
            <li>
              <a href="https://github.com/LeeJuhae/Program_42">
                API를 사용한 평가 알림 슬랙봇 개발
              </a>
            </li>
            <div style={subStyle}>
              API를 사용하여 평가 정보를 보여주는 슬랙봇 개발
              <br />
              Flask, OAuth, CronJob, AWS
              <br />
              OAuth로 사용자 관리 및 스케줄링하는 백엔드와 AWS 배포 담당
            </div>
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
              <a href="https://github.com/soda-infra">Aladdin</a>
            </li>
            <div style={subStyle}>
              React, Typescript, Go
              <br />
              오픈소스인 kiali 커스터마이징하여 쿠버네티스 기반의 마이크로서비스
              클러스터 모니터링 서비스개발
              <br />
              각 노드의 인프라 관련 정보(pod별 cpu사용율, 메모리 사용율 등)를
              추가
              <br />
              오픈인프라 경진대회 금상 수상
            </div>
          </p>
          <p>
            <li>
              <a href="https://github.com/jjungeun/blog">개인 블로그</a>
            </li>
            <div style={subStyle}>
              Graph QL, React
              <br />글 태그 기능, 카테고리 기능, 시간순으로 글을 정렬해서
              보여주는 아카이브기능, 댓글 기능을 추가
            </div>
          </p>
          <h5>2018</h5>
          <p>
            <li>
              객체지향 공부를 위한 Round-Trip Engineering기반의 UML, 소스코드
              컨버터
            </li>
            <div style={subStyle}>Java로 파싱하는 부분 담당</div>
          </p>
          <p>
            <li>IOT기반의 따릉이 헬멧관리 모니터링 서비스</li>
            <div style={subStyle}>
              SpringBoot 백엔드 담당
              <br />
              남양주 해커톤 장려상 수상
            </div>
          </p>
          <p>
            <li>클립보드와 Google Vision API기반 일정 등록 자동화 서비스</li>
            <div style={subStyle}>안드로이드와 Google Vision API부분 담당</div>
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
