$(document).ready(function(){
    //efecto scroll

    $(".seccion").on('click', function(event) {
      if (this.hash !== "") {
        event.preventDefault();
        var hash = this.hash;
        var desp = $(hash).offset().top - 70
        $('html, body').animate({
          scrollTop: desp,
          scrollBottom: '70px'
        }, 1500);
    }
    });

    //desplazamiento
    $("#backend").slideToggle();
    $("#frontend").slideToggle();
    $("#bases").slideToggle();
    $("#otras").slideToggle();
    
    $('.toggle').on('click',function(event){
        event.preventDefault();
        if (this.hash !== "") {
            $(this.hash).slideToggle();
        }
    })

    //
    const tabs = document.querySelectorAll('[data-target]'),
    tabContents = document.querySelectorAll('[data-content]')

    tabs.forEach(tab => {
    tab.addEventListener('click', () =>{
        const target = document.querySelector(tab.dataset.target)

        tabContents.forEach(tabContent =>{
            tabContent.classList.remove('seleccion-activa')
        })
        target.classList.add('seleccion-activa') 
        
        tabs.forEach(tab =>{
            tab.classList.remove('seleccion-activa')
        })
        tab.classList.add('seleccion-activa')
    })
    })



});