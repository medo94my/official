import React from 'react'

const Projects = () => {
  return (
    <section id="Portfolio">
            <div className="container  p-5">
              <div className="bg-text" style={{left:0}}>
                <h1 className="watermark ">my portfolio</h1> 
              </div>
              <div className="content">
              <h1 className="py-5 text-title"> my portfolio</h1>
                <div className="row">
                    <div className="col-md-6 col-lg-4 col-sm-12 my-sm-3">
                        <div className="card border-0 transform-on-hover custom-card">
                          <div className="p-4" style={{background: 'black'}}>
                            <img src="./src/img/avatar.png" alt="Card Image" className="card-img-top"/>
                          </div>
                            <div className="card-body">
                                <h6>E-commerce- martify grocery</h6>
                                <p className=" card-text">This was my FYP using php. This is an online grocery shop to be able to buy form major shops online and deliver it to home </p>
                                <p>Type:<span className="badge badge-pill badge-info mx-2">Solo</span></p>
                                <div className="d-flex justify-content-between">
                                  <a href="https://github.com/medo94my/undertesting" className="btn btn-warning mx-2" role="button" target="_blank" ><i className="fab fa-github-alt mx-1"></i>Github</a>
                                  <a name="" id="" className="btn btn-outline-warning mx-2" href="http://martifyapp.herokuapp.com/" target="_blank" role="button"><i className="far fa-eye mx-1"></i>View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 col-sm-12 my-sm-3">
                        <div className="card border-0 transform-on-hover custom-card">
                          <div className="p-4" style={{background: 'black'}}>
                            <img src="./src/img/avatar.png" alt="Card Image" className="card-img-top"/>
                          </div>
                            <div className="card-body">
                                <h6>GUESS number game</h6>
                                <p className=" card-text">This is a guess number its working the same idea of master mind. it assking user to guess the generated number to get points </p>
                                <p>Type:<span className="badge badge-pill badge-success  mx-2">Team</span></p>
                                <div className="d-flex justify-content-between">
                                  <a name="" href="https://github.com/medo94my/game-dev" id="" className="btn btn-warning mx-2" role="button" target="_blank"><i className="fab fa-github-alt mx-1"></i>Github</a>
                                  <a name="" id="" className="btn btn-outline-warning mx-2" href="https://mastermind-me.herokuapp.com/" role="button" target="_blank"><i className="far fa-eye mx-1"></i>View</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 col-sm-12 my-sm-3">
                        <div className="card border-0 transform-on-hover custom-card">
                          <div className="p-4" style={{background: 'black'}}>
                            <img src="./src/img/avatar.png" alt="Card Image" className="card-img-top"/>
                          </div>
                            <div className="card-body">
                                <h6>blog with reward system</h6>
                                <p className=" card-text">This project is a replica of stackoverflow but aiming toward gamers to discuss about newly launched games </p>
                                <p>Type:<span className="badge badge-pill badge-success  mx-2">Team</span></p>
                                <div className="d-flex justify-content-between">
                                  <a href="https://github.com/medo94my/wasi-furom" className="btn btn-warning mx-2" role="button" target="_blank"><i className="fab fa-github-alt mx-1"></i>Github</a>
                                  <a name="" id="" className="btn btn-outline-warning mx-2 disabled" href="#" role="button" target="_blank">
                                    <i className="far fa-eye-slash mx-1"></i>
                                    View</a>
                                </div>
                              </div>
                        </div>
                    </div>
            </div>
          </div>
            </div>
          </section>
  )
}

export default Projects