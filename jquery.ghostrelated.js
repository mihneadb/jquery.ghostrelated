;(function($) {

    defaults = {
        feed: '/rss',
        titleClass: '.post-title',
        tagsClass: '.post-meta',
        debug: false
    }


    function RelatedPosts(element, options) {

        this.element = element;
        this.options = $.extend({}, defaults, options);

        this.displayRelated();
    };


    RelatedPosts.prototype.displayRelated = function() {

        try {
            // Get current post information
            // Plugin is dependent on this data because matches are only made by tags at this time
            this._currentPostTags = this.getCurrentPostTags(this.options.tagsClass);

            var that = this;

            $.ajax({
                url: this.options.feed,
                type: 'GET'
            })
                .done(function(data) {

                    // Success fetching feed, find related posts and output them
                    var posts = that.getPosts(data);
                    var related = that.matchByTag(that._currentPostTags, posts);

                    related.forEach(function(post) {
                        $(that.element).append($('<li><a href="' + post.url + '">' + post.title + '</a></li>'));
                    });
                })
                .fail(function(e) {
                    throw Error(e);
                });

        } catch (e) {
            if (this.options.debug) {
                $(this.element).append($('<li>' + e.message + '</li>'));
            } else {
                console.log(this);
                $(this.element).append($('<li>No related posts were found.</li>'));
            }
        }
    };


    RelatedPosts.prototype.getCurrentPostTitle = function(titleClass) {

        if (titleClass[0] != '.') {
            titleClass = '.' + titleClass;
        }

        var postTitle = $(titleClass).text();

        if (postTitle.length < 1) {
            throw Error("Couldn't find the post title with class: " + titleClass)
        }

        return postTitle;
    };


    RelatedPosts.prototype.getCurrentPostTags = function(tagsClass) {

        if (tagsClass[0] != '.') {
            tagsClass = '.' + tagsClass;
        }

        var tags = [];
        $(tagsClass + ' a').each(function() {
            tags.push($(this).text());
        });

        if (tags.length < 1) {
            throw Error("Couldn't find any tags in this post");
        }

        return tags;
    };


    RelatedPosts.prototype.getPosts = function(feed) {

        var posts = [];
        var items = $(feed).find('item');

        for (var i = 0; i < items.length; i++) {

            var item = items.eq(i);

            if (item.find('title').text() !== this.getCurrentPostTitle(this.options.titleClass)) {

                posts.push({
                    title: item.find('title').text(),
                    url: item.find('link').text(),
                    content: item.find('description').text(),
                    tags: $.map(item.find('category'), function(elem) {
                        return $(elem).text();
                    })
                });
            }
        }

        if (posts.length < 1) {
            throw Error("Couldn't find any posts in feed: " + feed);
        }

        return posts;
    };


    RelatedPosts.prototype.matchByTag = function(postTags, posts) {

        var matches = [];

        posts.forEach(function(post) {

            var beenAdded = false;
            post.tags.forEach(function(tag) {

                postTags.forEach(function(postTag) {

                    if (postTag.toLowerCase() === tag.toLowerCase() && !beenAdded) {
                        matches.push(post);
                        beenAdded = true;
                    }
                });
            });
        });

        return matches;
    };


    $.fn.ghostRelated = function(options) {

        return this.each(function() {
            new RelatedPosts(this, options);
        });
    };


})(jQuery);