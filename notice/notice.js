/*
 * MIT License
 * @author naraku(https://github.com/callmeJozo)
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS之类的
        module.exports = factory();
    } else {
        // 浏览器全局变量(root 即 window)
        root.notice = factory();
    }
})(window, function() {
    var config = {},
        typeClass = {
            'open': 'notice',
            'info': 'notice notice-info has-icon',
            'success': 'notice notice-success has-icon',
            'wraning': 'notice notice-wraning has-icon',
            'error': 'notice notice-error has-icon'
        },
        iconType = {
            'open': '',
            'info': '&#451;',
            'success': '&#10003;',
            'wraning': '&#451;',
            'error': '&#215;'
        },
        defaultTimeout = 2,
        defaultTop = 50;
    var Notice = function(type, content, duration) {
        this.content = content || '';
        this.duration = duration == 0 ? 0 : duration || (config.duration == 0 ? 0 : (config.duration || defaultTimeout));
        this.top = config.top >= 0 ? config.top : defaultTop;
        this.typeClass = typeClass[type];
        this.iconType = iconType[type];
        this.$wrap = document.querySelector('.notice-wrap');
        this.$notice = void 0;
        this.$close = void 0;
        this.timer = void 0;
        this.init();
    };
    Notice.prototype = {
        constructor: Notice,
        init: function() {
            var $notice, $noticeIcon, $noticeClose;
            if (!this.$wrap) {
                this.$wrap = document.createElement('div');
                this.$wrap.className = 'notice-wrap';
                this.$wrap.style.top = this.top + 'px';
                document.querySelector('body').appendChild(this.$wrap);
            }
            this.render();
            this.bindEvent();
            if (this.duration > 0) {
                this.setTimeout();
            }
        },
        render: function() {
            this.$notice = $notice = document.createElement('div');
            $notice.className = this.typeClass;

            $noticeIcon = document.createElement('i');
            $noticeIcon.className = 'icon';
            $noticeIcon.innerHTML = this.iconType;

            $noticeContent = document.createElement('div');
            $noticeContent.className = 'notice-content';
            $noticeContent.innerHTML = this.content;

            this.$close = $noticeClose = document.createElement('i');
            $noticeClose.className = 'notice-close';
            $noticeClose.innerHTML = '&#215;';

            $notice.appendChild($noticeIcon);
            $notice.appendChild($noticeContent);
            $notice.appendChild($noticeClose);
            this.$wrap.appendChild($notice);
            setTimeout(function() {
                $notice.classList.add('notice-show');
            }, 100)
        },
        setTimeout: function() {
            var _this = this;
            this.timer = setTimeout(function() {
                _this.destroy();
            }, this.duration * 1000)
        },
        bindEvent: function() {
            var _this = this;
            this.$close.addEventListener('click', function() {
                _this.destroy();
                clearTimeout(_this.timer);
            })
        },
        destroy: function() {
            var _this = this;
            this.$notice.classList.remove('notice-show');
            setTimeout(function() {
                _this.$notice.remove();
            }, 300)
        }
    };
    var notice = {
        config: function(conf) {
            if (!conf) return;
            if (conf.top >= 0) {
                config.top = conf.top;
            }
            if (conf.duration >= 0) {
                config.duration = conf.duration;
            }
        },
        open: function(content, duration) {
            new Notice('open', content, duration);
        },
        info: function(content, duration) {
            new Notice('info', content, duration);
        },
        success: function(content, duration) {
            new Notice('success', content, duration);
        },
        wraning: function(content, duration) {
            new Notice('wraning', content, duration);
        },
        error: function(content, duration) {
            new Notice('error', content, duration);
        }
    };

    return notice;
})
