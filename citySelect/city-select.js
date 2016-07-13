/*
 * 城市选择jquer插件
 *
 * https://github.com/naraku666/city-select
 * Author: naraku666(https://github.com/naraku666/)
 * Version:  1.0.1  2016-01-14
 * Licensed under the MIT license:
 *
 */

! function($, undefined) {
    $.fn.citySelect = function(option) {
        console.log(1)
        new CitySelect($(this), option);
        return this;
    };

    function CitySelect($input, opt) {
        this.$input = $input;
        this.$container = null;
        this.$cityContainer = null;
        this.$resultContainer = null;
        this.$currentInput = null;
        this.isReady = false;
        this.default = {
            top: 5,
            left: 0
        };
        this.setting = $.extend({}, this.default, opt);
        this.init();
    };
    CitySelect.prototype = {
        constructor: CitySelect,
        init: function() {
            var $input = this.$input;
            var _this = this;
            // 输入框绑定事件
            $input.on('focus', function(e) {
                _this.$input = $(this);
                e.stopPropagation();
                _this.$currentInput = $(e.target);
                _this.showMainDom();
                _this.setPosition(_this.$currentInput)
            });

            $input.on('click', function(e) {
                e.stopPropagation();
            });
            $input.on('propertychange input', trottle(this.search, this));
            $input.on('keydown', function(e){
                var keyCode = e.keyCode,
                    value = '';
                switch(keyCode) {
                    // enter
                    case 13: 
                        value = _this.$resultContainer
                            .find('.active .name')
                            .text();
                        _this.setValue(value);
                        _this.$container.hide();
                        break;
                    // down
                    case 40: 
                        switchActive(true);
                        break;
                    // up
                    case 38: 
                        switchActive();
                        break;
                }
                function switchActive(isDown) {
                    var $active = _this.$resultContainer.find('.active');
                    var len = _this.$resultContainer.find('li').length - 1;
                    var index = $active.index();
                    $active.removeClass('active')
                    if(index == 0 && !isDown) {
                        _this.$resultContainer.find('li').eq(len).addClass('active');
                    }else if(index == len && isDown) {
                        _this.$resultContainer.find('li').eq(0).addClass('active');
                    }else {
                        $active[isDown ? 'next' : 'prev']().addClass('active');
                    }
                }
            });
        },
        bindEvents: function() {
            var _this = this;

            // 分类切换
            this.$tabNav.on('click', 'li', function(e) {
                e.stopPropagation();
                var current = $(e.target),
                    index = current.index();
                current
                    .addClass('active')
                    .siblings()
                    .removeClass('active');

                $('.kucity_item')
                    .eq(index)
                    .addClass('active')
                    .siblings()
                    .removeClass('active');

                $(' .kucity_body').scrollTop(0);
            });

            // 选中城市
            this.$tabItem.on('click', 'span', function(e) {
                e.stopPropagation();
                var text = $(e.target).text();
                _this.setValue(text);
                _this.$container.hide();
            });

            this.$resultContainer.on('click', '.result_item', function() {
                var value = $(this).find('.name').text();
                _this.$input.val(value)
            });

            this.$cityContainer.on('click', function(e) {
                e.stopPropagation();
            })

            $(document).on('click', function() {
                _this.$container.hide();
            });
        },
        search: function() {
            var SEARCH_URL = 'https://sjipiao.alitrip.com/city_search.do?q=';
            var _this = this;
            var value = this.$currentInput.val();
            var $result = this.$resultContainer;
            if(value) {
                $.ajax({
                    url: SEARCH_URL + value || '',
                    type: 'get',
                    dataType: 'jsonp'
                })
                .then(function(res) {
                    creatResult(res)
                })
            }else {
                _this.switchContainer();
            }
            function creatResult(res) {
                var result = res.result,
                    len = result.length,
                    str = '';
                if (!!len) {
                    for (var i = 0; i < len; i++) {
                        str = [
                            str,
                            '<li class="result_item"><span class="name">',
                            result[i].cityName,
                            '</span><span class="letter">',
                            result[i].py,
                            '</span></li>'
                        ].join('');
                    }
                    $result.html('').html(str).find('li').eq(0).addClass('active');
                } else {
                    $result.html('<li>没有找到<span class="noresult">' + value + '</span>的城市</li>');
                }
                _this.switchContainer(true);
            }
        },
        getCommonCities: function() {
            var URL = 'https://www.alitrip.com/go/rgn/trip/chinahotcity_jsonp.php';
            return $.ajax({
                url: URL,
                type: 'get',
                dataType: 'jsonp'
            });
        },
        setValue: function(value) {
            var $input = this.$currentInput;
            $input.val(value);
        },
        createMainDom: function(cities) {
            var html = [
                '<div class="kucity">',
                    '<div class="citybox">',
                        '<h3 class="kucity_header">热门城市(支持汉字/拼音搜索)</h3>',
                        '<ul class="kucity_nav">',
                        '</ul>',
                        '<div class="kucity_body">',
                            'loading....',
                        '</div>',
                    '</div>',
                    '<ul class="result"></ul>',
                '</div>'
            ].join('');

            var $container = this.$container = $(html);
            this.$cityContainer = $container.find('.citybox');
            this.$resultContainer = $container.find('.result');
            this.$tabNav = $container.find('.kucity_nav');
            this.$tabItem = $container.find('.kucity_body');
            $('body').append($container);
        },
        fillItems: function(cities) {
            var cityLength = cities.length;
            var tabHtml = '';
            this.$tabItem.html('');
            for (var i = 0; i < cityLength; i++) {
                tabHtml =  tabHtml + '<li class="' + (i == 0 ? 'active' : '')  + '">' + cities[i].tabname + '</>';
                createTabs(cities[i], this.$tabItem);
            }
            this.$tabNav.html(tabHtml);
            this.$tabItem
                .find('.kucity_item')
                .eq(0)
                .addClass('active');

            function createTabs(item, tabsContainer) {
                var currentItem = $('<div class="kucity_item group">');
                var tabdata = item.tabdata;
                for (var i = 0; i < tabdata.length; i++) {
                    var current = tabdata[i].dd;
                    var dl, dt, dd;
                    dl = $('<dl>');
                    if(tabdata[i].dt.replace(/\s/, '')){
                        dt = '<dt>' + tabdata[i].dt + '</dt>';
                    }
                    dd = $('<dd>');
                    str = '';
                    for (var j = 0, jLen = current.length; j < jLen; j++) {
                        str += '<span>' + current[j].cityName + '</span>'
                    }
                    dd.append(str);
                    dl.append(dt).append(dd);
                    currentItem.append(dl);
                }
                tabsContainer.append(currentItem);
            }
        },
        showMainDom: function() {
            var _this = this;
            if (this.$container) {
                _this.switchContainer();
                $(this.$container).show();
            }else{
                this.createMainDom();
            }
            if (!this.isReady) {
                this.getCommonCities().success(function(res) {
                    _this.fillItems(res.results);
                    _this.bindEvents();
                    _this.isReady = true;
                })
            }
        },
        switchContainer: function(showResult) {
            if(showResult) {
                this.$cityContainer.hide();
                this.$resultContainer.show()
            }else {
                this.$resultContainer.hide()
                this.$cityContainer.show();
            }
        },
        setPosition: function($target) {
            var top = $target.offset().top + $(window).scrollTop() + $target.outerHeight() + this.setting.top;
            left = $target.offset().left + $(window).scrollLeft() + this.setting.left;
            this.$container.css({
                top: top,
                left: left
            })
        }
    };

    function trottle(fn, context, delay) {
        var timer = null;
        return function() {
            if(timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function() {
                fn.apply(context, arguments);
            }, delay || 500);
        }
    }

}(jQuery, void 0);
