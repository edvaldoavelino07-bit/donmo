; (function ($) {
    "use strict";

    $(document).ready(function () {


        if ($(".swp-isotope").length) {

            var filterArea = $(".swp-isotope-area");

            filterArea.each(function () {

                var filterAreaId = $(this).data("filter-section");

                var Self = $(this);

                Self.find('.swp-isotope').addClass(filterAreaId);

                var $galleryFilterArea = $('.' + filterAreaId);

                //button            
                Self.find('.isotope-filters').addClass('swp' + filterAreaId);

                var $galleryFilterMenu = $('.swp' + filterAreaId);

                /*Filter*/
                $galleryFilterMenu.on('click', 'button, a', function () {
                    var $this = $(this),
                        $filterValue = $this.attr('data-filter');
                    $galleryFilterMenu.find('button, a').removeClass('active');
                    $this.addClass('active');
                    $galleryFilterArea.isotope({ filter: $filterValue });
                });
                /*Grid*/
                $galleryFilterArea.each(function () {
                    var $this = $(this),
                        $galleryFilterItem = '.swp-item';
                    $this.imagesLoaded(function () {
                        $this.isotope({
                            itemSelector: $galleryFilterItem,
                            percentPosition: true,
                            masonry: {
                                columnWidth: '.swp-sizer',
                            }
                        });
                    });
                });

            });

        }

    });
})(jQuery);