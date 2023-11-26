var d3PieChart_3d = (function () {
    function Create_3DPieChart(dataxml, element, id, width, height, innerRadius, outerRadius, labelRadius) {
        var pieChart_3D = new PieChart_3D(dataxml, element, id, width, height, innerRadius, outerRadius, labelRadius);
    }
    var PieChart_3D = function (dataxml, element, id, width, height, innerRadius, outerRadius, labelRadius) {
        var self = this;
        this._dataChart = null,
            this._rootElement = null,
            this._innerRadius = 0,
            this._outerRadius = 0,
            this._labelRadius = 0,
            this._height = 0,
            this._width = 0,
            this._id = null,
            this._data = null,
            this._svg = null,
            this._canvas = null,
            this._art = null,
            this._labels = null,
            this._cDim = null,
            this._pied_data = null,
            this._pied_arc = null,
            this._pied_colors = null,
            this._textLines = null,
            this._textLabels = null,
            this._alpha = 0.5,
            this._spacing = 12,
            this.appendSVG = function () {
                //Создание svg
                self._svg = d3.select("#" + self._rootElement).append('svg');
                self._canvas = self._svg.append('g').attr('id', 'canvas');
                self._art = self._canvas.append('g').attr('id', 'art');
                self._labels = self._canvas.append('g').attr('id', 'labels');
            },
            this.applyChartDimensions = function () {
                //Параметры svg
                self._cDim = {
                    height: self._height,
                    width: self._width,
                    innerRadius: self._innerRadius,
                    outerRadius: self._outerRadius,
                    labelRadius: self._labelRadius,
                };
                // Установка размера svg
                self._svg.attr('width', self._cDim.width).attr('height', self._cDim.height).attr('class', 'pie');

                // Центрирование диаграммы
                self._canvas.attr(
                    'transform',
                    'translate(' + self._cDim.width / 2 + ',' + self._cDim.height / 2 + ')'
                );
            },
            this.createPieRing = function () {
                // Создание макета диаграммы
                var jhw_pie = d3.pie();
                jhw_pie.value(function (d, _) {
                    // Указание на числовое значение для расчёта долей диаграммы
                    return d.value;
                });

                self._pied_data = jhw_pie(self._data);

                // Создание долей с учётом внутренного и внешнего радиусов
                self._pied_arc = d3.arc().innerRadius(self._innerRadius).outerRadius(self._outerRadius);

                // Установка цветовой палитры
                self._pied_colors = d3.scaleOrdinal(d3.schemeCategory10);

                var RotateY = 60;
                drawingArcs(self._art, self._pied_data, self._outerRadius, RotateY , 20, self._pied_colors);
                //drawingArcs(self._art, self._pied_data, self._pied_arc, self._pied_colors);

                //Создание тултипов для различных кусков диаграммы
                var divTooltip = createDivTooltip();
                createTooltips(self._svg, divTooltip);
            },
            this.createLabels = function () {
                // Отрисовка линий к тексту и самих текстов
                var enteringLabels = self._labels.selectAll('.label').data(self._pied_data).enter();
                var labelGroups = enteringLabels.append('g').attr('class', 'label');

                self._textLines = createTextLines(labelGroups, self._pied_arc, self._cDim);
                self._textLabels = createTextLabels(labelGroups, self._pied_arc, self._cDim);
            },
            this.prepareData = function () {
                self._data = createData(self._dataChart);
            },
            this.createChart = function () {
                self.appendSVG();
                self.applyChartDimensions();
                self.createPieRing();
                self.createLabels();
                relax(self._textLabels, self._textLines, self._alpha, self._spacing);
            };

        init(this, dataxml, element, id, width, height, innerRadius, outerRadius, labelRadius);
        this.prepareData();
        this.createChart();
    };

    function pieTop(d, rx, ry, ir) {
        /*if (d.endAngle - d.startAngle == 0) return "M 0 0";
        var sx = rx * Math.cos(d.startAngle),
            sy = ry * Math.sin(d.startAngle),
            ex = rx * Math.cos(d.endAngle),
            ey = ry * Math.sin(d.endAngle);

        var ret = [];
        ret.push("M", sx, sy, "A", rx, ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "1", ex, ey, "L", ir * Math.cos(d.endAngle), ir * Math.sin(d.endAngle));
        ret.push("A", ir, ir, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "0", ir * Math.cos(d.startAngle), ir * Math.sin(d.startAngle), "z");
        return ret.join(" ");*/

        // If angles are equal, then we got nothing to draw
        if (d.endAngle - d.startAngle == 0) return "M 0 0";

        // Calculating shape key points
        var sx = rx * Math.cos(d.startAngle),
            sy = ry * Math.sin(d.startAngle),
            ex = rx * Math.cos(d.endAngle),
            ey = ry * Math.sin(d.endAngle);

        // Creating custom path based on calculation
        var ret = [];
        ret.push("M", sx, sy, "A", rx, ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "1", ex, ey, "L", ir * ex, ir * ey);
        ret.push("A", ir * rx, ir * ry, "0", (d.endAngle - d.startAngle > Math.PI ? 1 : 0), "0", ir * sx, ir * sy, "z");
        return ret.join(" ");
    };

    function pieOuter(d, rx, ry, h) {
        /*var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
        var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);

        var sx = rx * Math.cos(startAngle),
            sy = ry * Math.sin(startAngle),
            ex = rx * Math.cos(endAngle),
            ey = ry * Math.sin(endAngle);

        var ret = [];
        ret.push("M", sx, h + sy, "A", rx, ry, "0 0 1", ex, h + ey, "L", ex, ey, "A", rx, ry, "0 0 0", sx, sy, "z");
        return ret.join(" ");*/

        // Process corner Cases
        if (d.endAngle == Math.PI * 2 && d.startAngle > Math.PI && d.startAngle < Math.PI * 2) {
            return ""
        }
        if (d.startAngle > Math.PI * 3 && d.startAngle < Math.PI * 4 &&
            d.endAngle > Math.PI * 3 && d.endAngle <= Math.PI * 4) {
            return ""
        }

        // Reassign startAngle  and endAngle based on their positions
        var startAngle = d.startAngle;
        var endAngle = d.endAngle;
        if (d.startAngle > Math.PI && d.startAngle < Math.PI * 2) {
            startAngle = Math.PI;
            if (d.endAngle > Math.PI * 2) {
                startAngle = 0;
            }
        }
        if (d.endAngle > Math.PI && d.endAngle < Math.PI * 2) {
            endAngle = Math.PI;
        }
        if (d.startAngle > Math.PI * 2) {
            startAngle = d.startAngle % (Math.PI * 2);
        }
        if (d.endAngle > Math.PI * 2) {
            endAngle = d.endAngle % (Math.PI * 2);
            if (d.startAngle <= Math.PI) {
                endAngle = Math.PI;
                startAngle = 0
            }
        }
        if (d.endAngle > Math.PI * 3) {
            endAngle = Math.PI
        }
        if (d.startAngle < Math.PI && d.endAngle >= 2 * Math.PI) {
            endAngle = Math.PI;
            startAngle = d.startAngle
        }

        // Calculating shape key points
        var sx = rx * Math.cos(startAngle),
            sy = ry * Math.sin(startAngle),
            ex = rx * Math.cos(endAngle),
            ey = ry * Math.sin(endAngle);

        // Creating custom path  commands based on calculation
        var ret = [];
        ret.push("M", sx, h + sy, "A", rx, ry, "0 0 1", ex, h + ey, "L", ex, ey, "A", rx, ry, "0 0   0", sx, sy, "z");

        // If shape is big enough, that it needs two separate outer shape , then draw second shape as well
        if (d.startAngle < Math.PI && d.endAngle >= 2 * Math.PI) {
            startAngle = 0;
            endAngle = d.endAngle;
            var sx = rx * Math.cos(startAngle),
                sy = ry * Math.sin(startAngle),
                ex = rx * Math.cos(endAngle),
                ey = ry * Math.sin(endAngle);
            ret.push("M", sx, h + sy, "A", rx, ry, "0 0 1", ex, h + ey, "L", ex, ey, "A", rx, ry, "0 0   0", sx, sy, "z");
        }

        // Assemble shape commands
        return ret.join(" ");

    };

    function pieInner(d, rx, ry, h, ir) {
        /*var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
        var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

        var sx = ir * Math.cos(startAngle),
            sy = ir * Math.sin(startAngle),
            ex = ir * Math.cos(endAngle),
            ey = ir * Math.sin(endAngle);

        var ret = [];
        ret.push("M", sx, sy, "A", ir, ir, "0 0 1", ex, ey, "L", ex, h + ey, "A", ir, ir, "0 0 0", sx, h + sy, "z");
        return ret.join(" ");*/
        // Normalize angles before we start any calculations
        var startAngle = (d.startAngle < Math.PI ? Math.PI : d.startAngle);
        var endAngle = (d.endAngle < Math.PI ? Math.PI : d.endAngle);

        // Take care of corner cases
        if (d.startAngle > Math.PI * 2 && d.endAngle < Math.PI * 3) {
            return "";
        }

        if (d.startAngle >= Math.PI * 2 && d.endAngle >= Math.PI * 2 && d.endAngle <= Math.PI * 3) {
            return "";
        }

        // Reassign startAngle  and endAngle based on their positions
        if (d.startAngle <= Math.PI && d.endAngle > Math.PI * 2) {
            startAngle = Math.PI;
            endAngle = 2 * Math.PI;
        }
        if (d.startAngle > Math.PI && d.endAngle >= Math.PI * 3) {
            endAngle = 2 * Math.PI;
        }
        if (d.startAngle > Math.PI && d.endAngle > Math.PI * 2 && d.endAngle < Math.PI * 3) {
            endAngle = 2 * Math.PI;
        }
        if (d.startAngle > Math.PI && d.startAngle < Math.PI * 2 && d.endAngle > Math.PI * 3) {
            endAngle = 2 * Math.PI;
            startAngle = Math.PI
        }
        if (d.startAngle > Math.PI && d.startAngle < Math.PI * 2 && d.endAngle > Math.PI * 3) {
            endAngle = 2 * Math.PI;
            startAngle = Math.PI
        }
        if (d.startAngle > Math.PI &&
            d.startAngle < Math.PI * 2 &&
            d.endAngle > Math.PI * 3) {
            startAngle = Math.PI;
            endAngle = Math.PI + d.endAngle % Math.PI;
        }
        if (d.startAngle > Math.PI * 2 &&
            d.startAngle < Math.PI * 3 &&
            d.endAngle > Math.PI * 3) {
            startAngle = Math.PI;
            endAngle = Math.PI + d.endAngle % Math.PI;
        }
        if (d.startAngle > Math.PI * 3 &&
            d.endAngle > Math.PI * 3) {
            startAngle = d.startAngle % (Math.PI * 2)
            endAngle = d.endAngle % (Math.PI * 2)
        }

        // Calculating shape key points
        var sx = ir * rx * Math.cos(startAngle),
            sy = ir * ry * Math.sin(startAngle),
            ex = ir * rx * Math.cos(endAngle),
            ey = ir * ry * Math.sin(endAngle);

        // Creating custom path  commands based on calculation
        var ret = [];
        ret.push("M", sx, sy, "A", ir * rx, ir * ry, "0 0 1", ex, ey, "L", ex, h + ey, "A", ir * rx, ir * ry, "0 0 0", sx, h + sy, "z");


        // If shape is big enough, that it needs two separate outer shape , then draw second shape as well
        if (d.startAngle > Math.PI &&
            d.startAngle < Math.PI * 2 &&
            d.endAngle > Math.PI * 3) {
            startAngle = d.startAngle % (Math.PI * 2);
            endAngle = Math.PI * 2;
            var sx = ir * rx * Math.cos(startAngle),
                sy = ir * ry * Math.sin(startAngle),
                ex = ir * rx * Math.cos(endAngle),
                ey = ir * ry * Math.sin(endAngle);
            ret.push("M", sx, sy, "A", ir * rx, ir * ry, "0 0 1", ex, ey, "L", ex, h + ey, "A", ir * rx, ir * ry, "0 0 0", sx, h + sy, "z");
        }

        // Assemble shape commands
        return ret.join(" ");
    };

    function pieCorner(d, rx, ry, h) {
        /*var startAngle = (d.startAngle > Math.PI ? Math.PI : d.startAngle);
        var endAngle = (d.endAngle > Math.PI ? Math.PI : d.endAngle);

        var sx = rx * Math.cos(startAngle),
            sy = ry * Math.sin(startAngle),
            ex = rx * Math.cos(endAngle),
            ey = ry * Math.sin(endAngle);

        var ret = [];
        ret.push("M", sx, sy, "A", rx, ry, "0 0 1", ex, ey, "L", ex, h + ey, "A", rx, ry, "0 0 0", sx, h + sy, "z");
        return ret.join(" ");*/

        //  Calculating  right corner surface key points
        var sxFirst = self._innerRadius * rx * Math.cos(d.endAngle);
        var syFirst = self._innerRadius * ry * Math.sin(d.endAngle);
        var sxSecond = rx * Math.cos(d.endAngle);
        var sySecond = ry * Math.sin(d.endAngle);
        var sxThird = sxSecond;
        var syThird = sySecond + h;
        var sxFourth = sxFirst;
        var syFourth = syFirst + h;

        // Creating custom path based on calculation
        return `
				M ${sxFirst} ${syFirst} 
				L ${sxSecond} ${sySecond}
				L ${sxThird} ${syThird} 
				L ${sxFourth} ${syFourth}
				z
				`
    };

    function pieCornerSurface(d, rx, ry, h) {
        /*var sx = rx * Math.cos(d.startAngle),
            sy = ry * Math.sin(d.startAngle),
            ex = rx * Math.cos(d.endAngle),
            ey = ry * Math.sin(d.endAngle);

        var ret = [];
        ret.push("M", sx, sy, "A", rx, ry, "0 0 1", ex, ey, "L", ex,

            h + ey, "A", rx, ry, "0 0 0", sx, h + sy, "z");
        return ret.join(" ");*/
        //  Calculating corner left surface key points

        var sxFirst = self._innerRadius * rx * Math.cos(d.startAngle);
        var syFirst = self._innerRadius * ry * Math.sin(d.startAngle)
        var sxSecond = rx * Math.cos(d.startAngle);
        var sySecond = ry * Math.sin(d.startAngle);
        var sxThird = sxSecond;
        var syThird = sySecond + h;
        var sxFourth = sxFirst;
        var syFourth = syFirst + h;

        // Creating custom path based on calculation
        return `
				M ${sxFirst} ${syFirst} 
				L ${sxSecond} ${sySecond}
				L ${sxThird} ${syThird} 
				L ${sxFourth} ${syFourth}
				z
	    `
    };

    //Инициализация значений
    function init(self, dataxml, element, id, width, height, innerRadius, outerRadius, labelRadius) {
        self._dataChart = getJsonChartData(dataxml);
        self._innerRadius = innerRadius;
        self._outerRadius = outerRadius;
        self._labelRadius = labelRadius;
        self._rootElement = element;
        self._height = height;
        self._width = width;
        self._id = id;
    };

    //Преобразование xml строки с данными графика в json объект
    function getJsonChartData(dataxml) {
        var x2js = new X2JS();
        var jsonObj = x2js.xml_str2json(dataxml);

        return { chart: jsonObj.chart };
    };

    //Создание массива с данными
    function createData(dataset) {
        var data = [];
        var dataChart = dataset.chart.set;

        for (var i = 0; i < dataChart.length; i++) {
            var dataItem = dataChart[i];
            var tooltext = dataItem._tooltext != null ? decodeURIComponent(dataItem._tooltext).replace("\n", "<br/>") : null;
            var item = {
                label: dataItem._label, value: (dataItem._value == "") ? null : (dataItem._value * 1), tooltext: tooltext
            };
            data.push(item);
        }
        return data;
    };
    /*function drawingArcs(art, pied_data, rx, ry, h, pied_colors)
    {
        var totalHeight = h; // Высота для 3D эффекта
        var depth = 5; // Глубина каждого слоя

        // Перебор каждого элемента данных и добавление слоев для создания 3D эффекта
        pied_data.forEach(function (d, i) {
            // Создание верхнего слоя доли
            art.append('path')
                .attr('class', 'wedge-top')
                .attr('d', pieTop(d, rx, ry, 0))
                .style('fill', pied_colors(i));

            // Создание боковых слоев
            for (var j = 0; j < totalHeight; j += depth) {
                art.append('path')
                    .attr('class', 'wedge-side')
                    .attr('d', pieOuter(d, rx, ry, j))
                    .style('fill', d3.rgb(pied_colors(i)).darker(j / totalHeight));
            }
        });

        // Поворот диаграммы для лучшего визуального эффекта
        art.attr('transform', 'translate(' + rx + ', ' + (ry + totalHeight) + ') rotateX(-30)');
    };*/
    function drawingArcs(art, pied_data, rx, ryConverted, h, pied_colors) {
        var enteringArcs = art.selectAll('.wedge').data(pied_data).enter();

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', function (d) {
                return pieTop(d, rx, ryConverted, 0);
            })
            .style('fill', function (d, i) {
                return pied_colors(i);
            });

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', function (d) {
                return pieOuter(d, rx - 0.5, ryConverted - 0.5, h);
            })
            /*.style('fill', function (d, i) {
                return pied_colors(i);
            });*/
            .style("fill", function (d, i) {
                return d3.hsl(pied_colors(i)).darker(0.7);
            });

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', function (d) {
                return pieInner(d, rx + 0.5, ryConverted + 0.5, 0);
            })
            .style('fill', function (d, i) {
                return pied_colors(i);
            });

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', function (d) {
                return pieCornerSurface(d, rx - 0.5, ryConverted - 0.5, h);
            })
            .style('fill', function (d, i) {
                return pied_colors(i);
            });
            

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', function (d) {
                return pieCorner(d, rx - 0.5, ryConverted - 0.5, h);
            })
            .style('fill', function (d, i) {
                return pied_colors(i);
            });
    };

    //Отрисовка долей диаграммы
    /*function drawingArcs(art, pied_data, pied_arc, pied_colors) {
        var enteringArcs = art.selectAll('.wedge').data(pied_data).enter();

        enteringArcs
            .append('path')
            .attr('class', 'wedge')
            .attr('d', pied_arc)
            .style('fill', function (d, i) {
                return pied_colors(i);
            });
    };*/

    //Создание линий к текстам
    function createTextLines(labelGroups, pied_arc, cDim) {
        return labelGroups
            .append('line')
            .attr('x1', function (d, _) {
                return pied_arc.centroid(d)[0];
            })
            .attr('y1', function (d, _) {
                return pied_arc.centroid(d)[1];
            })
            .attr('x2', function (d, _) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                return x;
            })
            .attr('y2', function (d, _) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                y = Math.sin(midAngle) * cDim.labelRadius;
                return y;
            })
            .attr('class', 'label-line')
            .attr('stroke-width', '1')
            .attr('stroke', '#393939');
    };

    //Создание текстов к долям
    function createTextLabels(labelGroups, pied_arc, cDim) {
        return labelGroups
            .append('text')
            .attr('x', function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                sign = x > 0 ? 1 : -1;
                labelX = x + 5 * sign;
                return labelX;
            })
            .attr('y', function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                y = Math.sin(midAngle) * cDim.labelRadius;
                return y;
            })
            .attr('text-anchor', function (d, i) {
                centroid = pied_arc.centroid(d);
                midAngle = Math.atan2(centroid[1], centroid[0]);
                x = Math.cos(midAngle) * cDim.labelRadius;
                return x > 0 ? 'start' : 'end';
            })
            .attr('class', 'label-text')
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-family', 'arial,helvetica,"sans-serif"')
            .attr('fill', '#393939')
            .text(function (d) {
                return d.data.label;
            });
    };

    //Создание тултипа
    function createDivTooltip() {
        const classNameTooltip = "tooltipChart";
        var divTooltip = d3.select("div." + classNameTooltip)
        if (divTooltip.size() == 0)
            divTooltip = d3.select("body").append("div")
                .attr("class", classNameTooltip)
                .style("opacity", 0);

        return divTooltip;
    };

    //Привязка появления тултипов к событиям наведения мыши на доли
    function createTooltips(svg, divTooltip) {
        svg.selectAll('path')
            .on("mouseover", function (event, d) {
                divTooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                divTooltip.html(d.data.tooltext)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    };

    //Установка расстояний между текстами к диаграмме
    function relax(textLabels, textLines, alpha, spacing) {
        let again = false;
        textLabels.each(function (d, i) {
            var elemA = this;
            var selectElemA = d3.select(elemA);
            var yA = selectElemA.attr('y');
            textLabels.each(function (d, j) {
                var elemB = this;
                // elemA & elemB являются одним и тем же элементом и не перекрывают друг друга
                if (elemA == elemB) return;
                var selectElemB = d3.select(elemB);
                // elemA & elemB на противоположных сторонах диаграммы и не перекрывают друг друга
                if (selectElemA.attr('text-anchor') != selectElemB.attr('text-anchor')) return;
                // Вычисление расстояния между элементами
                var yB = selectElemB.attr('y');
                var deltaY = yA - yB;

                // Расстояние больше желаемого и элементы не перекрывают друг друга
                if (Math.abs(deltaY) > spacing) return;

                // Тексты перекрывают друг друга, а потому к их координатам добавляется шаг,
                // чтобы отдалить их друг от друга
                again = true;
                var sign = deltaY > 0 ? 1 : -1;
                var adjust = sign * alpha;
                selectElemA.attr('y', +yA + adjust);
                selectElemB.attr('y', +yB - adjust);
            });
        });
        // Калибровка линий к текстам
        if (again) {
            var labelElements = textLabels._groups[0];
            textLines.attr('y2', function (d, i) {
                var labelForLine = d3.select(labelElements[i]);
                return labelForLine.attr('y');
            });
            // Функция вызывает саму себя и работает ровно до того момента,
            // пока все тексты не будут удалены на как минимум желаемое расстояние
            relax(textLabels, textLines, alpha, spacing);
        }
    };

    return {
        Create_3DPieChart: Create_3DPieChart
    };

}());
