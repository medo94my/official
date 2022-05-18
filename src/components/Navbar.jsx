import React from 'react'

export const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-5">
      <a className="navbar-brand ml-4" href="#"><img src="./src/img/logo edited2.svg" alt=""/></a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav  ms-auto text-uppercase ">
          <li className="nav-item">
            <a className="nav-link " href="#portfolio">Portfolio </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#service">SERVICES</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#about">About me</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="#skills" >skills</a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
