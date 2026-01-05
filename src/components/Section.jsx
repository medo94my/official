import React from "react"

const Section = ({ title, children, styles, secId }) => {
    return (
        <section 
            className="min-h-screen w-full flex flex-col justify-center items-center dark:bg-slate-900" 
            style={styles}
            id={secId}
        >
            <div className="w-full flex flex-col justify-center items-center">
                <h2 className="uppercase font-bold my-10 tracking-[2px] text-[rgba(255,255,255,0.85)] text-6xl">
                    {title}
                </h2>
                <div className="w-full justify-center items-center py-16">
                    {children}
                </div>
            </div>
        </section>
    )
}

export default Section
