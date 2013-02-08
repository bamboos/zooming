(function ($) {

    function onTime(event) {

    }

    var onEvents = {
        onMouseEnter: function(event) {
            var container = event.data.container;
            var settings = event.data.settings;
            var time = container.data('time');
            var bigImage = container.find('img:first');

            if (bigImage.width() == 0 && !settings.onDocumentLoad && time < settings.timeOut) {
                self.data('time', time + settings.timeStep);
                setTimeout(function() {
                    onEvents.onMouseEnter(event);
                }, settings.timeStep);
            } else {
                var bigImageWidth = bigImage.width();
                var bigImageHeight = bigImage.height();

                var containerHeight = container.height();
                var containerWidth = container.width();

                container.data('ratios', {
                    imageToContainerHeightRatio: (bigImageHeight - containerHeight) / (containerHeight - 2 * settings.padding),
                    imageToContainerWidthRatio: (bigImageWidth - containerWidth) / (containerWidth - 2 * settings.padding)
                });

                container.find('img:first').css('z-index', '1');
            }
        },

        onMouseLeave: function(event) {
            event.data.self.find('img:first').css('z-index', '-1');
        },

        onMouseMove: function(event) {
            var self = event.data.self;
            var offset = self.offset();
            var xPos = event.pageX - offset.left;
            var yPos = event.pageY - offset.top;
            var ratios = self.data('ratios');
            var settings = event.data.settings;

            xPos = xPos <= settings.padding ? 0 : (self.width() - xPos <= settings.padding ? self.width() - settings.padding * 2 : xPos - settings.padding);
            yPos = yPos <= settings.padding ? 0 : (self.height() - yPos <= settings.padding ? self.height() - settings.padding * 2 : yPos - settings.padding);

            if (ratios.imageToContainerHeightRatio > 0) {
                self.find('img:first').css('top', -1 * yPos * ratios.imageToContainerHeightRatio + 'px');
            } else {
                self.find('img:first').css('margin', 'auto 0');
                self.find('img:first').css('top', '0');
                self.find('img:first').css('bottom', '0');
            }

            if (ratios.imageToContainerWidthRatio > 0) {
                self.find('img:first').css('left', -1 * xPos * ratios.imageToContainerWidthRatio + 'px');
            } else {
                self.find('img:first').css('margin', '0 auto');
                self.find('img:first').css('left', '0');
                self.find('img:first').css('right', '0');
            }
        },

        onDocumentLoad: function(event) {
            var settings = event.data.settings;
            var all = event.data.all;
            var time = all.data('time');
            var loaded = [];
            var downloading = false;

            all.each(function() {
                var bigImage = $(this).find('img:first');

                if ($(this).find('img:first').width() == 0) {
                    downloading = true;
                } else if (bigImage.data('loaded') != true) {
                    loaded.push(bigImage);
                    bigImage.data('loaded', true);
                }
            });

            $.each(loaded, function() {
                var bigImageWidth = this.width();
                var bigImageHeight = this.height();
                var smallImage = this.siblings('img');

                var widthRatio = bigImageWidth / settings.smallImageWidth;
                var heightRatio = bigImageHeight / settings.smallImageHeight;
                var ratio = widthRatio > heightRatio ? widthRatio : heightRatio;

                smallImage.css('height', Math.round(bigImageHeight / ratio) + 'px');
                smallImage.css('width', Math.round(bigImageWidth / ratio) + 'px');
                smallImage.show();
            });

            if (downloading && time <= settings.timeOut) {
                all.data('time', time + settings.timeStep);
                console.log(time);
                setTimeout(function() {
                    onEvents.onDocumentLoad(event);
                }, settings.timeStep);
            }
        }
    };

    $.fn.zooming = function(method) {

        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.editortooltip');
        }
    };

    var methods = {

        init: function(options) {
            var settings = $.extend($.fn.zooming.defaults, options);

            if (settings.onDocumentLoad) {
                $(document).on('ready', { settings: settings, all: $(this) }, onEvents.onDocumentLoad);
            }

            this.each(function() {

                $(this).data('time', 0);

                if (settings.onContainerEnter) {
                    $(this).on('mouseenter', { settings: settings, container: $(this) }, onEvents.onMouseEnter);
                } else {
                    $(this).find('img:last').on('mouseenter', { settings: settings, container: $(this) }, onEvents.onMouseEnter);
                }

                $(this).find('img:first').on('mouseleave', { settings: settings, self: $(this) }, onEvents.onMouseLeave);
                $(this).on('mousemove', { settings: settings, self: $(this) }, onEvents.onMouseMove);
            });
        }
    };

    $.fn.zooming.defaults = {
        smallImageHeight: 250,
        smallImageWidth: 418,
        timeOut: 10000,
        timeStep: 100,
        onDocumentLoad: false,
        padding: 30,
        onContainerEnter: false
};

})(jQuery);