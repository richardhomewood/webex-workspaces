import Swiper from 'swiper';
import 'swiper/scss';

let swiper;
window.addEventListener('load', function () {

    const slides = Array.from(document.querySelectorAll(`.ws-category-content-root .swiper.room-swiper .swiper-slide`));
    const slideCount = slides.length;

    if (slideCount === 0) {
        return
    }

    if (slideCount == 2) {
        slides.forEach((element)=>{
            if (!element.classList.contains("fiftyfifty")){
                element.classList.add("fiftyfifty");
            }
        });
    } else {
        slides.forEach((element)=>{
            if (element.classList.contains("fiftyfifty")){
                element.classList.remove("fiftyfifty");
            }
        });
    }

    this.setTimeout(()=>{
        //const slideWidth = slides[0].offsetWidth;
        let totalSlideWidth = 0;

        slides.forEach((element)=>{
            console.log("element.offsetWidth", element.offsetWidth)
            totalSlideWidth += element.offsetWidth;
        })

        console.log("totalSlideWidth", totalSlideWidth)
        console.log("window.innerWidth", window.innerWidth)
        console.log("window.innerWidth - 38", window.innerWidth - 36)
        console.log("totalSlideWidth > (window.innerWidth - 36)", totalSlideWidth > (window.innerWidth - 36))

        let wouldBeSwiper = this.document.querySelector(".ws-category-content-root .swiper");
        const options = {
            speed: 400,
            slidesPerView: "auto",
            centeredSlides: true,
            centeredSlidesBounds: true,
            grabCursor: true,
            slideToClickedSlide: true,
            centerInsufficientSlides: true,
            enabled: false//totalSlideWidth > (window.innerWidth - 36)
        }
        swiper = new Swiper(wouldBeSwiper, options)
    }, 300)
    
});