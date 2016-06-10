/*
 * MIT License
 * @author naraku(https://github.com/callmeJozo)
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(imageLazy, factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.imageLazy = factory();
    }
}(this, function() {
    var ImageLazy = function(container, opts) {
        this.container = typeof container == 'string' ? document.querySelector(container) : container;
        this.debounceTime = 30;
        this.disdance = 0;
        this.imgList = [];
        for (var key in opts) {
            this[key] = opts[key];
        }
        this.init();
    }

    ImageLazy.prototype = {
        constructor: ImageLazy,
        init: function() {
            var imgNodeList = this.container.querySelectorAll('img');
            try {
                this.imgList = Array.prototype.slice.call(imgNodeList);
            } catch (err) {
                this.imgList = Array.prototype.concat.apply([], imgNodeList);
            }
            this.bindEvents();
            this.loadItems();
        },
        bindEvents: function() {
            addEventListener('scroll', debounce(this.debounceTime, this.loadItems, this));
            addEventListener('resize', debounce(this.debounceTime, this.loadItems, this));
        },
        loadItems: function() {
            var list = this.imgList,
                i = 0,
                len = list.length,
                current = null,
                dataSrc;
            for (; i < len; i++) {
                current = list[i];
                if (isOnViewPort(current, this.disdance)) {
                    dataSrc = current.getAttribute('data-src');
                    if (dataSrc) {
                        current.setAttribute('src', dataSrc);
                        (function(current) {
                            setTimeout(function() {
                                current.className += 'fade';
                            }, 0)
                        })(current)
                        list.splice(i, 1);
                        i--;
                        len--;
                    }
                }
            }
        },
    }

    return function(container, opt) {
        return new ImageLazy(container, opt)
    }

    function isOnViewPort(img, disdance) {
        disdance = disdance >= 0 ? disdance : 0;
        var offsetTop = getTop(img) - disdance,
            top = offsetTop + img.offsetHeight + disdance,
            clientHeight = document.documentElement.clientHeight,
            scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        return ((top > scrollTop) && (top < clientHeight + scrollTop)) || ((offsetTop > scrollTop) && (offsetTop < clientHeight + scrollTop));
    }

    function getTop(img) {
        var top = img.offsetTop,
            currentParent = img.offsetParent;
        while (currentParent) {
            top += currentParent.offsetTop;
            currentParent = currentParent.offsetParent;
        }
        return top;
    }

    function debounce(debounceTime, fn, context) {
        var last;
        return function() {
            clearTimeout(last)
            last = setTimeout(function() {
                fn.call(context)
            }, debounceTime)
        }
    }

    function addEventListener(event, handler) {
        if (window.addEventListener) {
            window.addEventListener(event, handler, false);
        } else if (window.attachEvent) {
            window.attachEvent('on' + event, handler)
        } else {
            window['on' + event] = handler;
        }
    }
}));
