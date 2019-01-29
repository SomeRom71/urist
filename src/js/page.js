import Inputmask from "inputmask";
import Scrollbar from 'smooth-scrollbar';
import Magnific from "magnific-popup";
import Tilt from "tilt.js";

global.$ = require('jquery');

// svg4everybody init
svg4everybody();

/*
$(window).scroll(function(){
    var st = $(this).scrollTop();
    $(".femida").css({
        "transform" : "translate(0px, " + st /10 +"px"
    });
}) */

$(document).ready(function() {

var im = new Inputmask("+7 (999) 999 99 99",{showMaskOnHover: false});
im.mask('.mask');

$('.consult-form__btn').click(function() {
    $('.gendir-text__consult-num').html(function(i, val){
        val = (val<1)?0:val*1-1;
        return val;
    });
});

var HeaderTop = $('.s-services').offset().top;
        
$(window).scroll(function(){
    if( $(window).scrollTop() > HeaderTop ){
        $('.header').css({position: 'fixed', top: '0px', width: '100%', "box-shadow": 'rgba(35, 35, 184, 0.1) 0px 29px 27px 0px'});
        $('.header__logo').css({display: 'none'});
        $('.header .menu').css({display: 'block'});
        $('.contact-btn').css({"box-shadow": 'rgba(35, 35, 184, 0.15) 0px 29px 27px 0px'});
    } 
    else{
        $('.header').css({position: 'static'});
        $('.header__logo').css({display: 'inline-block'});
        $('.header .menu').css({display: 'none'});
    }
});


$('.popup-with-form').magnificPopup({
    type: 'inline',
    preloader: false,
    focus: '#name',
    callbacks: {
        beforeOpen: function() {
            if($(window).width() < 700) {
                this.st.focus = false;
            } else {
                this.st.focus = '#name';
            }
        }
    }
});


$('.mobile-menu__btn').click(function() {
    $(this).parent().toggleClass("open");
}); 

$('.more__item').hover(function() {
    $(this).children('.more__dropdown').slideDown(900);
}, function() {
    $(this).children('.more__dropdown').slideUp(900);
});

    var $accordion = $('.js-accordion'),
    $btns = $accordion.find('.js-accordionButton'),
    $contents = $accordion.find('.js-accordionContent'),
    $item = $accordion.find('.js-accordionItem');
    
    $contents.on('click', function (e) {
        e.stopPropagation();
    });

    $btns.on('click', function(e) {
        e.preventDefault();

        var $that = $(this);
        if (!$that.hasClass('_open')) {
            $item.removeClass('_open');
            $contents.slideUp();

            $that.addClass('_open');
            $contents.eq($that.index()).stop().slideDown();
        } else {
            $item.removeClass('_open');
            $contents.stop().slideUp();
        }
    });

    ymaps.ready(function(){
        var myMap = new ymaps.Map("YMapsID", {
            center: [48.481101, 135.083972],
            zoom: 17,
            controls: ['zoomControl']
        }),
        myPlacemark = new ymaps.Placemark(myMap.getCenter(), {
            hintContent: 'г. Хабаровск, ул.Постышева, д.22А, оф.513',
            balloonContent: ''
        }, {
            iconLayout: 'default#image',
            iconImageHref: 'images/map-point.png',
            iconImageSize: [74, 78],
            iconImageOffset: [-40, -95]
        });
    myMap.geoObjects.add(myPlacemark);
    myMap.behaviors.disable('scrollZoom');
    });

    $('.ajax').submit(function() { //Change
        var th = $(this);
        $.ajax({
            type: "POST",
            url: "mail.php", //Change
            data: th.serialize()
        }).done(function() {
            th.trigger("reset");
            th.find('.popup-with-form').trigger("click");
        });
        return false;
    });
});



