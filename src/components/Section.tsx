import React from 'react'

const Section = ({ title, children, styles, secId }) => {
  return (
    <div className={`min-h-screen ${styles}`}>
      <div
        className="flex flex-col justify-center items-center w-full"
        id={secId}
      >
        <h2 className="uppercase font-bold my-5 tracking-wider text-white/85 text-2xl">
          {title}
        </h2>
        <div className="py-16 flex flex-wrap justify-center items-center">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Section
