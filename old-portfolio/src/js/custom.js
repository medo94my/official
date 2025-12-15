function mode(){
    var element=document.body
    var icon= document.querySelector('#icon')
    var btn= document.querySelector('.circle')
    var nav= document.querySelector('.navbar')
    var nav_tog= document.querySelector('.navbar-toggler')
    var nav_icon= document.querySelector('.navbar-toggler')
    var footer= document.querySelector('.footer')
    var text_fields= document.querySelectorAll('.text-title')
    element.classList.toggle('dark-mode')
    function changetext(colors){
     text_fields.forEach(e=>{
       e.style.color=colors
       })
    }
   if (icon.classList.toggle('fa-moon')){
       console.log('night')
      changetext('white')
      nav.classList.add('bg-dark')
      nav.classList.add('navbar-dark')
      nav.classList.remove('bg-light')
      nav.classList.remove('navbar-light')
      footer.classList.add('bg-primary')
      footer.classList.remove('bg-light')
   }
   if (icon.classList.toggle('fa-sun')){
       console.log('light')
       nav.classList.remove('bg-dark')
       nav.classList.remove('navbar-dark')
       nav.classList.add('navbar-light')
       nav.classList.add('bg-light')
       footer.classList.remove('bg-primary')
       footer.classList.add('bg-light')
       changetext('black')
   }
  }