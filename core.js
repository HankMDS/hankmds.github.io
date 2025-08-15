lokis.MyExam = function() {}
;
lokis.MyExam.prototype = new lokis.UserExam();
lokis.MyExam.prototype.client = {
    answers: []
};
lokis.MyExam.prototype.buildExamUI = function() {
    var c = this;
    var b = setInterval(function() {
        try {
            var q = "";
            var l = c.userPaperTopics.length;
            clearInterval(b);
            if (c.paperInfo.config.paperType == 2) {
                q += '<span title="提示所有试题答案" class="cue float-left   hand" id="allTopicCue"></span>'
            }
            q += "共【" + l + "】题：";
            var p = 0;
            var o = 0;
            var m = 0;
            var h = 0;
            var g = 0;
            var f = 0;
            for (i in c.userPaperTopics) {
                var d = parseInt(c.userPaperTopics[i].topic.topicType);
                switch (d) {
                case 1:
                    p++;
                    break;
                case 2:
                    o++;
                    break;
                case 3:
                    m++;
                    break;
                case 4:
                    h++;
                    break;
                case 5:
                    g++;
                    break;
                case 6:
                    f++;
                    break
                }
            }
            if (p > 0) {
                q += "单选【" + p + "】题；"
            }
            if (o > 0) {
                q += "多选【" + o + "】题；"
            }
            if (m > 0) {
                q += "判断【" + m + "】题；"
            }
            if (h > 0) {
                q += "填空【" + h + "】题；"
            }
            if (g > 0) {
                q += "简答【" + g + "】题；"
            }
            if (f > 0) {
                q += "论述【" + f + "】题；"
            }
            $("#topicInfoNav").html(q);
            // --- MODIFICATION START ---
            // 在答题界面，只预选答案，不显示下方文本答案
            c.showTopic({showAnswers: true});
            // --- MODIFICATION END ---
            c.importArchive();
            c.beginExam()
        } catch (n) {}
    }, 300)
}
;
lokis.MyExam.prototype.importArchive = function(e) {
    if (!!this.userArchive && !!this.userArchive.length > 0) {
        var c = _mergeAnswer(this.userArchive);
        var d = this;
        var b = c[0].name;
        if (!b) {
            b = c[0][0].name
        }
        if ($("input[name='" + b + "']").size() > 0 || $("textarea[name='" + b + "']").size() > 0) {
            __importArchive(d, c, e)
        } else {
            var f = setInterval(function() {
                if ($("input[name='" + b + "']").size() > 0 || $("textarea[name='" + b + "']").size() > 0) {
                    clearInterval(f);
                    __importArchive(d, c, e)
                }
            }, 300)
        }
    }
}
;
lokis.MyExam.prototype.showTopic = function(g) {
    var f = this;
    if (!!g && !!g.gradeData) {
        var c = this.basePath + "rest/json/exam/e" + this.examId + "/p" + this.paperId + "/archive/u" + this.userId + "/i" + this.examIndex + "-grade.json?random=" + Math.random();
        $.getJSON(c, function(l) {
            l = $.parseJSON(l);
            var h = [];
            for (_i in l) {
                h[parseInt(l[_i].name.substring(1))] = l[_i].value
            }
            g.gradeData = h;
            // --- MODIFICATION START ---
            // 在查卷界面，既预选答案，又显示下方文本答案
            g.showAnswers = true; // 启用预选
            g.isReview = true;    // 启用文本答案显示
            // --- MODIFICATION END ---
            __showTopic(f, g)
        }).fail(function() {
            __showTopic(f, g)
        })
    } else {
        __showTopic(f, g)
    }
    $(".topicMark").each(function() {
        $(this).on("click", function() {
            $(this).parent().toggleClass("already-mark", "");
            var h = parseInt($(this).parent().parent().attr("id").substring(1)) + 1;
            if ($(this).parent().hasClass("already-mark")) {
                e(h, true)
            } else {
                e(h, false)
            }
        })
    });
    $(".topicCue").each(function() {
        $(this).on("click", function() {
            d(f, this);
            $(this).parent().find("input").attr("disabled", "disabled")
        })
    });
    $("#allTopicCue").click(function() {
        $(".topicCue").each(function() {
            d(f, this);
            $(this).parent().find("input").attr("disabled", "disabled")
        });
        $("#allTopicCue").off("click")
    });
    function d(o, m) {
        var n = parseInt($(m).parent().parent().attr("id").substring(1));
        var h = o.client.answers[n];
        if (!h) {
            h = o.userPaperTopics[n].topic.answer
        }
        var l = '<br /><br /><span class="blue size-14 b">正确答案为：' + h + "</span>";
        $(m).after(l);
        $(m).parent().find("input").attr("disabled", "true");
        $(m).off("click");
        $(m).removeClass("topicCue")
    }
    var b = [];
    function e(h, l) {
        if (!!l) {
            b[h] = h
        } else {
            b[h] = undefined
        }
        var m = "已标记试题：";
        for (_i in b) {
            if (!!b[_i]) {
                m += '<a href="#s' + (_i - 1) + '"><span class="label label-warning hand">' + _i + "</span></a>&nbsp;"
            }
        }
        $("#alreadyMarks").html(m);
        $("._mark").each(function() {
            $(this).on("click", function() {
                var n = $(this).html();
                g = {
                    topicIndex: n - 1
                };
                _jumpTopic(g)
            })
        })
    }
}
;
lokis.MyExam.prototype.manualSubmitPaper = function() {
    var n = this;
    var h = n.userPaperTopics;
    for (i = 0; i < h.length; i++) {
        $("#s" + i).removeClass("warn-green")
    }
    cheat_decrement();
    if (confirm("确定要交卷吗？交卷后此次考试结束！")) {
        $("#invalidSubmitButton").show();
        $("#submitButton").hide();
        n.inArchive();
        var l = _mergeAnswer(n.userArchive);
        if (l.length < 1) {
            cheat_decrement();
            alert("没有答题，不能交卷");
            $("#invalidSubmitButton").hide();
            $("#submitButton").show();
            return
        }
        var g = [];
        var d = 0;
        var b = "题号：";
        var f = 0;
        for (i = 0; i < h.length; i++) {
            var m = null;
            if (l[d]instanceof Array) {
                m = l[d][0].name
            } else {
                m = l[d].name
            }
            if (m == ("t" + i)) {
                if (d < l.length - 1) {
                    d++
                }
            } else {
                f++;
                g[g.length] = "s" + i;
                if (f <= 5) {
                    b += (i + 1) + ","
                }
            }
        }
        if (g.length > 0) {
            for (k in g) {
                $("#" + g[k]).addClass("warn-green")
            }
            var e = $("#confirmDialog");
            if (!e[0]) {
                var c = '<div id="confirmDialog">还有试题未答<br />[' + b + '......],未答试题背景被置为<span class="warn-green">绿色</span>。<br />点击<span style="background: orange; color: white;">取消</span>可取消本次交卷，继续答题，<br />点击<span style="background: red; color: white;">确定</span>将直接交卷！<br /><div style="width: 320px;" class="center"><input type="button" id="submitDialog" value="确定" />&nbsp;&nbsp;<input type="button" id="cancelDialog" value="取消" /></div></div>';
                $(document.body).append(c);
                $("#confirmDialog").dialog({
                    autoOpen: false,
                    height: 200,
                    width: 350,
                    modal: true
                });
                $("#submitDialog").on("click", function() {
                    ONBLUR_COUNT = 0;
                    n.autoSubmitPaper();
                    $("#confirmDialog").remove()
                });
                $("#cancelDialog").on("click", function() {
                    $("#confirmDialog").remove()
                })
            }
            cheat_decrement();
            $("#confirmDialog").dialog("open")
        } else {
            ONBLUR_COUNT = 0;
            n.autoSubmitPaper()
        }
        $("#invalidSubmitButton").hide();
        $("#submitButton").show()
    }
}
;
lokis.MyExam.prototype.paperGrade = function(l) {
    var b = [];
    if (this.dataLog.paperGradeStart) {
        return
    }
    this.dataLog.paperGradeStart = true;
    this.userScore.score = 0;
    var g = _mergeAnswer(this.userArchive);
    var t = this.userPaperTopics;
    var f = 0;
    var y = 0;
    var d = 0;
    for (i in g) {
        var n = null;
        if (g[i]instanceof Array) {
            n = g[i][0].name
        } else {
            n = g[i].name
        }
        var c = parseInt(n.substring(1));
        var r = parseInt(t[c].topic.topicType);
        var m = this.paperInfo.config.approFormula;
        switch (r) {
        case 1:
            try {
                if (g[i].value.toUpperCase() == t[c].topic.answer.toUpperCase()) {
                    f += t[c].topicValue;
                    this.dataLog.rightTopics[this.dataLog.rightTopics.length] = t[c].topicId
                } else {
                    this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId;
                    b[b.length] = getErrorTopicObject(g[i].value.toUpperCase(), this.userId, t[c].topic.id, this.examId, this.paperId)
                }
            } catch (w) {
                this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId
            }
            break;
        case 2:
            try {
                var o = "";
                if (g[i]instanceof Array) {
                    for (j in g[i]) {
                        o += g[i][j].value.toUpperCase()
                    }
                } else {
                    o = g[i].value.toUpperCase()
                }
                var z = t[c].topic.answer.toUpperCase();
                var s = false;
                for (userAnswerIndex = 0; userAnswerIndex < o.length; userAnswerIndex++) {
                    var h = o.charAt(userAnswerIndex);
                    if (z.indexOf(h) < 0) {
                        s = true;
                        break
                    }
                }
                if (!s) {
                    if (o.length == z.length) {
                        y += t[c].topicValue;
                        this.dataLog.rightTopics[this.dataLog.rightTopics.length] = t[c].topicId
                    } else {
                        if (!!m && m != "") {
                            var x = (o.length / z.length) * t[c].topicValue;
                            y += x;
                            this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId
                        } else {
                            this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId;
                            b[b.length] = getErrorTopicObject(g[i].value.toUpperCase(), this.userId, t[c].topic.id, this.examId, this.paperId)
                        }
                    }
                }
            } catch (w) {
                this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId
            }
            break;
        case 3:
            var o = g[i].value;
            var q = t[c].topic.answer;
            if (q == "0") {
                q = "错误"
            } else {
                if (q == "1") {
                    q = "正确"
                }
            }
            if (o == q) {
                d += t[c].topicValue;
                this.dataLog.rightTopics[this.dataLog.rightTopics.length] = t[c].topicId
            } else {
                this.dataLog.errorTopics[this.dataLog.errorTopics.length] = t[c].topicId;
                b[b.length] = getErrorTopicObject(g[i].value, this.userId, t[c].topic.id, this.examId, this.paperId)
            }
            break;
        default:
        }
    }
    f = parseFloat(f.toFixed(2));
    y = parseFloat(y.toFixed(2));
    d = parseFloat(d.toFixed(2));
    if (!!this.onlyError && this.onlyError != "") {
        this.userScore.scoreAppend = "[只答错题]答对" + this.dataLog.rightTopics.length + "题，答错" + this.dataLog.errorTopics.length + "题"
    } else {
        this.userScore.scoreAppend = "单选得分" + f + "，多选得分" + y + "，判断得分" + d;
        if (!!l) {
            this.userScore.scoreAppend += l
        }
    }
    var u = (f + y + d);
    u = parseFloat(u.toFixed(2));
    this.userScore.score = u;
    try {
        if (!!window.opener.document.getElementById("inExam")) {
            if (!!this.onlyError && this.onlyError != "") {
                var p = parseInt(this.examInfo.viewScorePattern);
                if (!!p && p > 1) {
                    var v = ('<div class="col-md-11" ><p><span class="green font-bold">[只答错题]</span>答对<span class="font-bold red">' + this.dataLog.rightTopics.length + '</span>题，答错<span class="font-bold red">' + this.dataLog.errorTopics.length + "</span>题</p></div>")
                }
                window.opener.document.getElementById("paperSubmitBox").innerHTML = v
            } else {
                var v = "";
                var p = parseInt(this.examInfo.viewScorePattern);
                if (!!p && p > 1) {
                    if (!!this.paperInfo.planPassValue) {
                        v += '<p class="font-size24 orange">' + this.userScore.score + "分" + (this.userScore.score >= this.paperInfo.planPassValue ? '<span class="label label-success">合格</span>' : '<span class="label label-success">不合格</span>') + "</p>";
                        if (this.userScore.score > 0 && this.userScore.score >= this.paperInfo.planPassValue) {
                            this.dataLog.qualifiedFlag = 1
                        }
                    } else {
                        v += '<p class="font-size24 orange">' + this.userScore.score + "分</p>"
                    }
                    if (!!l) {
                        v += "<p>" + l + "</p>"
                    }
                } else {
                    v += "<p>交卷完成！</p>"
                }
                window.opener.document.getElementById("paperSubmitSocre").innerHTML = v
            }
        }
    } catch (w) {}
    this.dataLog.paperGradeFlag = true;
    if (b.length > 0 && !!this.examInfo && this.examInfo.examModel == 1) {
        $.ajax({
            type: "POST",
            url: this.basePath + "rest/ef/theory/error-topic/add",
            data: {
                errorTopics: JSON.stringify(b)
            }
        }).done(function(e) {})
    }
}
;
lokis.MyExam.prototype.inArchive = function() {
    var b = $("#form1").serializeArray();
    if (!!b && b.length > 0) {
        this.userArchive = b
    }
}
;
function _mergeAnswer(c) {
    var d = [];
    var b = null;
    for (i in c) {
        if (i > 0) {
            if (c[i].name == c[i - 1].name) {
                b = d[d.length - 1];
                if (b instanceof Array) {
                    b[b.length] = c[i]
                } else {
                    b = [];
                    b[b.length] = c[i - 1];
                    b[b.length] = c[i]
                }
                d.pop();
                d[d.length] = b
            } else {
                d[d.length] = c[i];
                b = null
            }
        } else {
            d[d.length] = c[i]
        }
    }
    return d
}
function __showTopic(C, q) {
    var d = "";
    var b = 0;
    for (index in C.userPaperTopics) {
        var z = C.userPaperTopics[index];
        var m = parseInt(z.topic.topicType);
        var B = z.topic.content;
        var w = z.topic.topicOption;
        var x = z.topicValue;
        var A = z.topic.answer;
        var h = 1 + parseInt(index);
        var g = z.topic.imgCount;
        var l = null;
        if (!!w && w != "") {
            if (w.indexOf("｜") > -1) {
                var p = /｜/g;
                w = w.replace(p, "|")
            }
            l = w.split("|");
            var n = [];
            for (i in l) {
                if (!!l[i] && l[i] != "") {
                    n[n.length] = l[i]
                }
            }
            l = n
        }
        var u = null;
        if (!!A && A != "") {
            if (A.indexOf("｜") > -1) {
                var p = /｜/g;
                A = A.replace(p, "|")
            }
            u = A.split("|");
            var o = [];
            for (i in u) {
                if (!!u[i] && u[i] != "") {
                    o[o.length] = u[i]
                }
            }
            u = o
        }
        var F = z.itemStrategy;
        var s = 0;
        try {
            s = parseInt(F)
        } catch (D) {}
        d += '<div class="row "  id="s' + index + '">';
        d += '<div class="col-md-12">';
        if (!!C.interval.timerIntervalId) {
            d += '<span class="icon-3 float-left   topicMark hand"><i class="glyphicon glyphicon-info-sign" title="标记与取消标记"></i> </span>';
            if (C.paperInfo.config.paperType == 2) {
                d += '<span class="icon-3 float-left  topicCue hand"><i class="glyphicon glyphicon-info-sign" title="提示答案"></i> </span> '
            }
        }
        d += '  <span class="orange float-left">[第' + h + '题]&nbsp;</span><span class="blue float-left">' + theoryTopicTypeMap[m] + ":&nbsp;</span><span>" + B + '<span class="label label-primary">' + x + "分</span></span>";
        if (m == 2) {
            if (!!C.paperInfo.config.approFormula && C.paperInfo.config.approFormula != "") {
                d += '<br /><span class="red">酌情评分公式：' + C.paperInfo.config.approFormula + '&nbsp;&nbsp;</span><span class="blue">说明：r表示正确答案个数，s表示标准答案个数。注意：有错误答案不得分</span>'
            }
        }
        d += " </div>";
        if (!!g && g != "") {
            d += ' <div class="col-md-12"> ';
            g = parseInt(g);
            for (var E = 0; E < g; E++) {
                d += '<img src="../topic/images/' + z.topic.id + "-" + (E + 1) + '.gif" border="0" />'
            }
            d += "</div>"
        }
        // --- MODIFICATION START: Conditional "标准答案" display ---
        // 仅在查卷模式下显示标准答案文本
        if (!!q && !!q.isReview) {
            d += ' <span class="blue ">标准答案：';
            if (!!u && u.length > 1) {
                for (var f = 0; f < u.length; f++) {
                    d += '<span class="red">' + (f + 1) + '.</span><span class="underline">&nbsp;&nbsp;&nbsp;&nbsp;' + u[f] + "&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;&nbsp;"
                }
            } else {
                if (m == 3) { // 判断题的特殊处理
                    if (A == "0") {
                        A = "错误"
                    } else {
                        if (A == "1") {
                            A = "正确"
                        }
                    }
                }
                d += A
            }
            d += "</span><br />"
        }
        // --- MODIFICATION END ---
        d += '<div class="col-md-12"> ';
        switch (m) {
        case 1: // 单选题
            try {
                // 预选逻辑依赖 showAnswers
                if ((!!q && !!q.showAnswers) || s <= 0) {
                    var t = 65;
                    for (i = 0; i < l.length; i++) {
                        var r = String.fromCharCode(t);
                        var isChecked = (!!q && !!q.showAnswers && r === A) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="radio" disabled="disabled" value="' + r + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="radio" value="' + r + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        }
                        t++
                    }
                } else {
                    var t = 65;
                    for (i = s; i < l.length; i++) {
                        op2 = t + s;
                        var r = String.fromCharCode(t);
                        var v = String.fromCharCode(op2);
                        var isChecked = (!!q && !!q.showAnswers && v === A) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="radio" disabled="disabled" value="' + v + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="radio" value="' + v + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        }
                        if (A == v) {
                            C.client.answers[index] = r
                        }
                        t++
                    }
                    t = 65;
                    var y = 0;
                    if (s > l.length) {
                        y = l.length
                    } else {
                        y = s
                    }
                    for (i = 0; i < y; i++) {
                        op2 = t + (l.length - s);
                        var r = String.fromCharCode(t);
                        var v = String.fromCharCode(op2);
                        var isChecked = (!!q && !!q.showAnswers && r === A) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="radio" disabled="disabled" value="' + r + '"' + isChecked + ' />' + v + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="radio" value="' + r + '"' + isChecked + ' />' + v + ":" + l[i] + "<br />"
                        }
                        if (A == r) {
                            C.client.answers[index] = v
                        }
                        t++
                    }
                }
            } catch (D) {
                alert("第" + h + "题没有选项，试题编号：" + z.topicId)
            }
            break;
        case 2: // 多选题
            try {
                // 预选逻辑依赖 showAnswers
                if ((!!q && !!q.showAnswers) || s <= 0) {
                    var t = 65;
                    for (i = 0; i < l.length; i++) {
                        var r = String.fromCharCode(t);
                        var isChecked = (!!q && !!q.showAnswers && A.includes(r)) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="checkbox" disabled="disabled" value="' + r + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="checkbox" value="' + r + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        }
                        t++
                    }
                } else {
                    var t = 65;
                    for (i = s; i < l.length; i++) {
                        op2 = t + s;
                        var r = String.fromCharCode(t);
                        var v = String.fromCharCode(op2);
                        var isChecked = (!!q && !!q.showAnswers && A.includes(v)) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="checkbox" disabled="disabled" value="' + v + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="checkbox" value="' + v + '"' + isChecked + ' />' + r + ":" + l[i] + "<br />"
                        }
                        if (A.indexOf(v) > -1) {
                            if (!C.client.answers[index]) {
                                C.client.answers[index] = r
                            } else {
                                C.client.answers[index] += r
                            }
                        }
                        t++
                    }
                    t = 65;
                    var y = 0;
                    if (s > l.length) {
                        y = l.length
                    } else {
                        y = s
                    }
                    for (i = 0; i < y; i++) {
                        op2 = t + (l.length - s);
                        var r = String.fromCharCode(t);
                        var v = String.fromCharCode(op2);
                        var isChecked = (!!q && !!q.showAnswers && A.includes(r)) ? ' checked="checked"' : '';
                        if (!!q && !!q.readonly) {
                            d += '<input name="t' + index + '" type="checkbox" disabled="disabled" value="' + r + '"' + isChecked + ' />' + v + ":" + l[i] + "<br />"
                        } else {
                            d += '<input name="t' + index + '" type="checkbox" value="' + r + '"' + isChecked + ' />' + v + ":" + l[i] + "<br />"
                        }
                        if (A.indexOf(r) > -1) {
                            if (!C.client.answers[index]) {
                                C.client.answers[index] = v
                            } else {
                                C.client.answers[index] += v
                            }
                        }
                        t++
                    }
                }
            } catch (D) {
                alert("第" + h + "题没有选项，试题编号：" + z.topicId)
            }
            break;
        case 3: // 判断题
            // 修复判断题预选逻辑，依赖 showAnswers
            var correctAnswerText = (A == "0") ? "错误" : "正确";
            var isCheckedTrue = (!!q && !!q.showAnswers && correctAnswerText === "正确") ? ' checked="checked"' : '';
            if (!!q && !!q.readonly) {
                d += '<input name="t' + index + '" type="radio" disabled="disabled"  value="正确"' + isCheckedTrue + ' />正确<br />';
            } else {
                d += '<input name="t' + index + '" type="radio" value="正确"' + isCheckedTrue + ' />正确<br />';
            }
            var isCheckedFalse = (!!q && !!q.showAnswers && correctAnswerText === "错误") ? ' checked="checked"' : '';
            if (!!q && !!q.readonly) {
                d += '<input name="t' + index + '" type="radio" disabled="disabled" value="错误"' + isCheckedFalse + ' />错误<br />'
            } else {
                d += '<input name="t' + index + '" type="radio" value="错误"' + isCheckedFalse + ' />错误<br />'
            }
            break;
        case 4: // 填空题
            if (!!q && !!q.grade) {
                d += '<span class="blue  b">评分：</span><input type="input" class="width-4 {maxValue : ' + x + '}" title="不能大于总分值" style="margin-bottom: 5px;" value="0.0" name="g' + index + '" /><br />'
            }
            if (!!q && !!q.gradeData && !!q.gradeData[index]) {
                d += '<span class="red b">已评分：' + q.gradeData[index] + "</span><br />"
            }
            try {
                for (i = 0; i < u.length; i++) {
                    if (!u[i]) {
                        continue
                    }
                    // 预填逻辑依赖 showAnswers
                    var blankAnswerValue = (!!q && !!q.showAnswers) ? ' value="' + u[i] + '"' : '';
                    if (!!q && !!q.readonly) {
                        d += ((i + 1) + '.&nbsp;<input name="t' + index + '" type="text" readonly="readonly" style="margin-bottom: 4px;"' + blankAnswerValue + '  /><br />')
                    } else {
                        d += ((i + 1) + '.&nbsp;<input name="t' + index + '" type="text" style="margin-bottom: 4px;" onfocus="cheat_decrement()" ' + blankAnswerValue + ' /><br />')
                    }
                }
            } catch (D) {
                alert("第" + h + "题没有标准答案，试题编号：" + z.topicId)
            }
            b++;
            break;
        case 5: // 简答题
            if (!!q && !!q.grade) {
                d += '<span class="blue  b">评分：</span><input type="input" class="width-4 {maxValue : ' + x + '}" title="不能大于总分值" style="margin-bottom: 5px;" value="0.0" name="g' + index + '" /><br />'
            }
            if (!!q && !!q.gradeData && !!q.gradeData[index]) {
                d += '<span class="red b">已评分：' + q.gradeData[index] + "</span><br />"
            }
            // 预填逻辑依赖 showAnswers
            var essayAnswerContent = (!!q && !!q.showAnswers) ? A : '';
            if (!!q && !!q.readonly) {
                d += '<textarea name="t' + index + '" rows="10" readonly="readonly" class="width-p10"> ' + essayAnswerContent + ' </textarea><br />'
            } else {
                d += '<textarea name="t' + index + '" rows="10" class="width-p10" onfocus="cheat_decrement()" > ' + essayAnswerContent + ' </textarea><br />'
            }
            b++;
            break;
        case 6: // 论述题
            if (!!q && !!q.grade) {
                d += '<span class="blue  b">评分：</span><input type="input" class="width-4 {maxValue: ' + x + '}" title="不能大于总分值" style="margin-bottom: 5px;" value="0.0" name="g' + index + '" /><br />'
            }
            if (!!q && !!q.gradeData && !!q.gradeData[index]) {
                d += '<span class="red b">已评分：' + q.gradeData[index] + "</span><br />"
            }
            // 预填逻辑依赖 showAnswers
            var discussionAnswerContent = (!!q && !!q.showAnswers) ? A : '';
            if (!!q && !!q.readonly) {
                d += '<textarea name="t' + index + '" rows="20" class="width-p10" readonly="readonly"> ' + discussionAnswerContent + ' </textarea><br />'
            } else {
                d += '<textarea name="t' + index + '" rows="20" class="width-p10" onfocus="cheat_decrement()" > ' + discussionAnswerContent + ' </textarea><br />'
            }
            b++;
            break;
        default: // 其他题型
            if (!!q && !!q.grade) {
                d += '<span class="blue  b">评分：</span><input type="input" class="width-4 {maxValue: ' + x + '}" title="不能大于总分值" style="margin-bottom: 5px;" value="0.0" name="g' + index + '" /><br />'
            }
            if (!!q && !!q.gradeData && !!q.gradeData[index]) {
                d += '<span class="red b">已评分：' + q.gradeData[index] + "</span><br />"
            }
            // 预填逻辑依赖 showAnswers
            var defaultAnswerContent = (!!q && !!q.showAnswers) ? A : '';
            if (!!q && !!q.readonly) {
                d += '<textarea name="t' + index + '" rows="20" class="width-p10" readonly="readonly"> ' + defaultAnswerContent + ' </textarea><br />'
            } else {
                d += '<textarea name="t' + index + '" rows="20" class="width-p10" onfocus="cheat_decrement()" > ' + defaultAnswerContent + ' </textarea><br />'
            }
            b++;
            break
        }
        d += "</div></div>"
    }
    if (!!q && !!q.grade && b > 0) {
        d += '<div class = "margin-center width-10 margin-t-10"><input type="button" id="grade" value="提交评分" /></div><br />'
    }
    $("#content").html(d);
    C.dataLog.showTopicState = true
}
function _importArchive(o, c, d) {
    var h = [];
    for (i in c) {
        var b = null;
        try {
            b = parseInt(c[i].name.substring(1))
        } catch (g) {
            b = parseInt(c[i][0].name.substring(1))
        }
        h[b] = true;
        var m = parseInt(o.userPaperTopics[b].topic.topicType);
        switch (m) {
        case 1:
        case 3:
            $("input[name='" + c[i].name + "']").each(function(e) {
                if (!!d && !!d.look) {
                    if (e == 0) {
                        var p = $(this).parent().prev().prev().html();
                        p = p.substring(p.indexOf("：") + 1);
                        if (p != c[i].value) {
                            $(this).parent().parent().children().first().addClass("warn")
                        }
                    }
                }
                if (this.value == c[i].value) {
                    $(this)[0].checked = "checked"
                }
            });
            break;
        case 2:
            var n = null;
            var f = "";
            var l = "";
            if (!!c[i][0]) {
                $("input[name='" + c[i][0].name + "']").each(function(e) {
                    if (!!d && !!d.look) {
                        if (e == 0) {
                            n = this;
                            f = $(this).parent().prev().prev().html();
                            f = f.substring(f.indexOf("：") + 1);
                            var p = new Array();
                            for (e in c[i]) {
                                p[e] = c[i][e].value
                            }
                            p.sort();
                            for (a in p) {
                                l += p[a]
                            }
                        }
                    }
                    for (e in c[i]) {
                        if (this.value == c[i][e].value) {
                            $(this)[0].checked = "checked";
                            break
                        }
                    }
                })
            } else {
                $("input[name='" + c[i].name + "']").each(function(e) {
                    if (!!d && !!d.look) {
                        if (e == 0) {
                            n = this;
                            var p = $(this).parent().prev().prev().html();
                            p = p.substring(p.indexOf("：") + 1)
                        }
                    }
                    if (this.value == c[i].value) {
                        l += c[i].value;
                        $(this)[0].checked = "checked"
                    }
                })
            }
            if (!!d && !!d.look && f != l) {
                $(n).parent().parent().children().first().addClass("warn")
            }
            break;
        case 4:
            if (!!c[i][0]) {
                $("input[name='" + c[i][0].name + "']").each(function(e) {
                    $(this).val(c[i][e].value)
                })
            } else {
                if (!!c[i]) {
                    $("input[name='" + c[i].name + "']").each(function() {
                        $(this).val(c[i].value)
                    })
                }
            }
            break;
        case 5:
        case 6:
            $("textarea[name='" + c[i].name + "']").each(function(e) {
                $(this).val(c[i].value)
            });
            break
        }
    }
    for (i in o.userPaperTopics) {
        if (!!d && !!d.look && !h[i]) {
            $("#s" + i).children().first().addClass("warn-green")
        }
    }
}
function _jumpTopic(b) {}
function setFont(b) {
    $("#content").css("font-size", b)
}
function getErrorTopicObject(c, f, d, g, b) {
    var e = {
        answer: c,
        userId: f,
        topicId: d,
        examId: g,
        paperId: b
    };
    return e
}
;