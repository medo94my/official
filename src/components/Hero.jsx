import React from 'react'

export const Hero = () => {
  return (
    <section id="bg-hero" className="d-flex justify-content-center align-items-center">
              <div className="work text-uppercase">
                
                <h1 className="greeting">Hello, I am</h1>
                <h1 className="name"> Ahmed Tawfik Ali</h1>
                <h6 className="occupation ">Code Trainer & Software Developer</h6>
              </div>
                          <div  className=" btn-hero">
                            <a href="#Portfolio" className="btn btn-outline-warning">SEE PORTFOLIO <i className="fas fa-arrow-right ml-2"></i></a>
                          </div>
        </section>
  )
}
