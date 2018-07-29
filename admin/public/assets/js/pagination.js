(function($, window, document) {
    function Paging(el, options,type) {
        this.el = el;
        this.options = {
            pageNo: options.initPageNo || 1,
            totalPages: options.totalPages || 1,
            totalCount: options.totalCount || '',
            slideSpeed: options.slideSpeed || 0,
            jump: options.jump || false,
            callback: options.callback || function() {}
        };
        this.init();
    }
    Paging.prototype = {
        constructor: Paging,
        init: function() {
            this.createDom();
            this.bindEvents();
        },
        createDom: function() {
            var that = this,
                ulDom = '',
                jumpDom = '',
                content = '',
                liWidth = 60,
                totalPages = that.options.totalPages,
                wrapLength = 0;
            totalPages > 5 ? wrapLength = 5 * liWidth : wrapLength = totalPages * liWidth;
            for (var i = 1; i <= that.options.totalPages; i++) {
                i != 1 ? ulDom += '<li class="page-item page-link">' + i + '</li>' : ulDom += '<li class="sel-page page-item page-link">' + i + '</li>';
            }
            that.options.jump ? jumpDom = '<input type="text" placeholder="1" class="jump-text" id="jumpText"><button type="button" class="jump-button" id="jumpBtn">Jump</button>' : jumpDom = '';

            content = '<div class="row"><ul class="pagination"><li id="firstPage" class="turnPage first-page page-item page-link">first</li><li class="turnPage page-item page-link" id="prePage">back</li></ul><div class="pageWrap" style="width:' + wrapLength + 'px"><ul id="pageSelect" class="pagination" style="transition:all ' + that.options.slideSpeed + 'ms">' + ulDom + '</ul></div><ul class="pagination"><li class="turnPage page-item page-link" id="nextPage">next</li><li id="lastPage" class="last-page page-item page-link">last</li></ul></div>' + jumpDom;
            that.el.html(content);
        },
        bindEvents: function() {
            var that = this,
                pageSelect = $('#pageSelect'),
                lis = pageSelect.children(),
                liWidth = lis[0].offsetWidth,
                totalPages = that.options.totalPages,
                pageIndex = that.options.pageNo,
                distance = 0,
                prePage = $('#prePage'),
                nextPage = $('#nextPage'),
                firstPage = $('#firstPage'),
                lastPage = $('#lastPage'),
                jumpBtn = $('#jumpBtn'),
                jumpText = $('#jumpText');

            prePage.on('click', function() {
                pageIndex--;
                if (pageIndex < 1) pageIndex = 1;
                handles(pageIndex);
            })

            nextPage.on('click', function() {
                pageIndex++;
                if (pageIndex > lis.length) pageIndex = lis.length;
                handles(pageIndex);
            })

            firstPage.on('click', function() {
                pageIndex = 1;
                handles(pageIndex);
            })

            lastPage.on('click', function() {
                pageIndex = totalPages;
                handles(pageIndex);
            })

            jumpBtn.on('click', function() {
                var jumpNum = parseInt(jumpText.val().replace(/\D/g, ''));
                if (jumpNum && jumpNum >= 1 && jumpNum <= totalPages) {
                    pageIndex = jumpNum;
                    handles(pageIndex);
                    jumpText.val(jumpNum);
                }
            })

            lis.on('click', function() {
                pageIndex = $(this).index() + 1;
                handles(pageIndex);
            })

            function handles(pageIndex) {
                lis.removeClass('sel-page').eq(pageIndex - 1).addClass('sel-page');
                if (totalPages <= 5) {
                    that.options.callback(pageIndex);
                    return false;
                }
                if (pageIndex >= 3 && pageIndex <= totalPages - 2) distance = (pageIndex - 3) * liWidth;
                if (pageIndex == 2 || pageIndex == 1) distance = 0;
                if (pageIndex > totalPages - 2) distance = (totalPages - 5) * liWidth;
                pageSelect.css('transform', 'translateX(' + (-distance) + 'px)');
                pageIndex == 1 ? firstPage.attr('disabled', true) : firstPage.attr('disabled', false);
                pageIndex == 1 ? prePage.attr('disabled', true) : prePage.attr('disabled', false);
                pageIndex == totalPages ? lastPage.attr('disabled', true) : lastPage.attr('disabled', false);
                pageIndex == totalPages ? nextPage.attr('disabled', true) : nextPage.attr('disabled', false);
                that.options.callback(pageIndex);
            }

            if (type = 'back'){
              function getQueryString(name) {
    		        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    		        var r = window.location.search.substr(1).match(reg);
    		        if (r != null) return unescape(r[2]);
    		        return null;
  		        }
      		    if(getQueryString('page') == null ){
      		    	lis.removeClass('sel-page').eq(0).addClass('sel-page');
      		    } else {
      		    	lis.removeClass('sel-page').eq(getQueryString('page') - 1).addClass('sel-page');
      		    }
            } else {
              handles(that.options.pageNo);
            }

        }
    }
    $.fn.paging = function(options) {
        return new Paging($(this), options);
    }
})(jQuery, window, document);
