import React from 'react'

const Services = () => {
  return (
    <section id="service">
    <div className="bg-text">
          <h1 className="watermark " >my Services</h1> 
        </div>
        
        <div className="container">
          <div className="content">

          <h1 className="py-5 text-title">My Services</h1>
          <div className="row">
            <div className="col-lg-4 col-md-6 col-sm-12 my-2 d-flex align-items-center justify-content-center">
              <div className="card rounded d-flex align-items-center" style={{width: '15rem'}}>
                <img className="card-img-top w-25 pt-3 " src="src/img/custom.svg"  alt="Card image cap"/>
                <div className="card-body">
                  <p className="card-text text-center">Planning the most suitable technology that is needed for the desired application</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12 my-2  d-flex align-items-center justify-content-center">
              <div className="card rounded d-flex align-items-center" style={{width: '15rem'}}>
                <img className="card-img-top w-25 pt-3 " src="src/img/custom.svg"  alt="Card image cap"/>
                <div className="card-body">
                  <p className="card-text text-center">Begin to design the interface and implement the required styles</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-sm-12 my-2  d-flex align-items-center justify-content-center">
              <div className="card rounded d-flex align-items-center" style={{width: '15rem'}}>
                <img className="card-img-top w-25 pt-3 " src="src/img/custom.svg"  alt="Card image cap"/>
                <div className="card-body">
                  <p className="card-text text-center">Develop the application according to the plan has been selected before</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>
  )
}

export default Services