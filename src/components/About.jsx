import React from 'react'

const About = () => {
  return (
    <section id="about">
            <div className="container" >
              <div className="bg-text" style={{left:0}}>
                <h1 className="watermark">About me</h1> 
              </div>
              <div className="content">
              <h1 className="py-5 text-title"> About</h1>
                       <div className="p-3 p-lg-5 d-flex align-items-center">
                        <div className="w-100">
                          <h1 className="mb-0 text-title">Ahmed
                            <span className="text-warning">Tawfik</span>
                          </h1>
                          <div className="subheading mb-5 text-title">
                            <div>Based in Istanbul, Turkey</div> <div>+601111884535</div> 
                            <a href="mailto:medoroyalrma@gmail.com" className="text-warning">medoroyalrma@gmail.com</a>
                          </div>
                          <p className="lead mb-5 text-title ">I am experienced in website designing using up to date technology and experinced in backend technology such as python falsk and python django and vanilla javascript </p>
                          <div className="footer-social my-5">
                            <div className="container">
                            <div className="d-flex justify-content-center">
                            <a className="footer-social-link d-inline-flex mx-3 justify-content-center align-items-center text-white rounded-circle shadow btn btn-github" target="_blank" href="https://github.com/medo94my">
                            <i className="fab fa-github"></i>
                            </a>
                            
                            
                            <a className="footer-social-link d-inline-flex mx-3 justify-content-center align-items-center text-white rounded-circle shadow btn btn-twitter" target="_blank" href="https://twitter.com/medo94_my">
                            <i className="fab fa-twitter"></i>
                            </a>
                            <a className="footer-social-link d-inline-flex mx-3 justify-content-center align-items-center text-white rounded-circle shadow btn btn-facebook" target="_blank" href="https://www.linkedin.com/in/ahmad-tawfiq-8ba147126/">
                            <i className="fab fa-linkedin"></i>
                            </a>
                            </div>
                            </div>
                            </div>
                        </div>
                        <img className="about-img" src="src/img/about.svg" width="500" alt=""/>
                      </div></div>
                      </div></section>
  )
}

export default About