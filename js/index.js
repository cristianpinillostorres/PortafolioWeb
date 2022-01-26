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

    //card

    $("#backend").slideToggle();
    $("#frontend").slideToggle();
    $("#bases").slideToggle();
    $("#otras").slideToggle();
    
    $('.toggle').on('click',function(event){
        event.preventDefault();
        if (this.hash !== "") {
            var h = this.hash;
            $(h).slideToggle();
        }
    })



});