; (function ($) {
    "use strict";

    var SwpEventpressSlider = function ($scope) {

        let SwpOwlCarousels = $scope.find(".swp-eventpress-carousel");
        if (SwpOwlCarousels.length) {
            SwpOwlCarousels.each(function () {
                let elm = $(this);
                let options = elm.data('owl-options');
                let SwpOwlCarousel = elm.owlCarousel("object" === typeof options ? options : JSON.parse(options));
            });
        }


    };

    var SwpEventpressTab = function ($scope) {
        if ($scope.find(".swp-tab-menu li a").length) {
            $('.swp-tab-menu li a').on('click', function () {
                var target = $(this).attr('data-rel');
                $('.swp-tab-menu li a').removeClass('active');
                $(this).addClass('active');
                $("#" + target).fadeIn('slow').siblings(".swp-tab-box").hide();
                return false;
            });
        }
    };


    $(window).on("elementor/frontend/init", function () {

        elementorFrontend.hooks.addAction(
            "frontend/element_ready/swp-eventpress-slider.default",
            SwpEventpressSlider
        );

        elementorFrontend.hooks.addAction(
            "frontend/element_ready/swp-eventpress-tab.default",
            SwpEventpressTab
        );


    });


})(jQuery);
