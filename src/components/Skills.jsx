import React from 'react'

const Skills = () => {
  return (
    <section id="skills">
    <div className="bg-text">
          <h1 className="watermark " >my skills</h1> 
        </div>
        
        <div className="container">
          <div className="content">

          
          <h1 className="py-5 text-title"> skills</h1>
          <div className="row">
            <div className="col-lg-6 col-md-6 col-sm-12 my-2 d-flex align-items-center justify-content-center">
              <div className="media p-3 justify-content-center">
                <img src="src/img/web-design.png" className=" align-self-center mr-3 " width="64" alt="..."/>
                <div className="media-body">
                  <h5 className="mt-0 text-title">Frontend Technology</h5>
                  <div className="py-3"> <span className="skill">HTML</span><span className="skill">CSS3</span><span className="skill">JavaScript</span></div>
                </div>
                
              </div> 
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 my-2  d-flex align-items-center justify-content-center">
              <div className="media p-3 justify-content-center">
                <img src="src/img/web-programming.png" className=" align-self-center mr-3 " width="64" alt="..."/>
                    <div className="media-body">
                      <h5 className="mt-0 text-title">Backend Technology</h5>
                      <div className="py-3"> <span className="skill">Python</span><span className="skill">PHP</span><span className="skill">C#</span></div>
                    </div>
                  </div>  
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 my-2  d-flex align-items-center justify-content-center">
              <div className="media p-3 justify-content-center">
                <img src="src/img/web.png" className=" align-self-center mr-3 " width="64" alt="..."/>
                <div className="media-body">
                  <h5 className="mt-0 text-title">FrameWorks</h5>
                  <div className="py-3"> <span className="skill">Flask</span><span className="skill">Django</span><span className="skill">Laravel</span></div>
                </div>
              </div>      
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12 my-2  d-flex align-items-center justify-content-center">
              <div className="media p-3 justify-content-center">
                <img src="src/img/web-page.png" className=" align-self-center mr-3 " width="64" alt="..."/>
                <div className="media-body">
                  <h5 className="mt-0 text-title">Database Management</h5>
                  <div className="py-3"> <span className="skill">MYSQL</span><span className="skill">MONGODB</span></div>
                </div>
                
              </div>      
            </div>
          </div>
        </div>
        </div>
      </section>
  )
}

export default Skills