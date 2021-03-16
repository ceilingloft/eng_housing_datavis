export default {
  "$schema": "https://vega.github.io/schema/vega/v5.json",
  "background": "white",
  "padding": 20,
  "width": 300,
  "height": 300,
  "title": {
    "anchor": "start",
    "offset": 20,
  },
  "style": "cell",
  "data": [
    {
      "name": "data-e030dd797eff50d18299f8a5494a1ffc",
      "values": [
        {"Year": 1999, "Median amount (£)": 71000, "Index": "House price"},
        {"Year": 2000, "Median amount (£)": 79995, "Index": "House price"},
        {"Year": 2001, "Median amount (£)": 89950, "Index": "House price"},
        {"Year": 2002, "Median amount (£)": 106000, "Index": "House price"},
        {"Year": 2003, "Median amount (£)": 127250, "Index": "House price"},
        {"Year": 2004, "Median amount (£)": 148000, "Index": "House price"},
        {"Year": 2005, "Median amount (£)": 158000, "Index": "House price"},
        {"Year": 2006, "Median amount (£)": 165000, "Index": "House price"},
        {"Year": 2007, "Median amount (£)": 175000, "Index": "House price"},
        {"Year": 2008, "Median amount (£)": 177807, "Index": "House price"},
        {"Year": 2009, "Median amount (£)": 167000, "Index": "House price"},
        {"Year": 2010, "Median amount (£)": 180000, "Index": "House price"},
        {"Year": 2011, "Median amount (£)": 180000, "Index": "House price"},
        {"Year": 2012, "Median amount (£)": 181500, "Index": "House price"},
        {"Year": 2013, "Median amount (£)": 185000, "Index": "House price"},
        {"Year": 2014, "Median amount (£)": 195000, "Index": "House price"},
        {"Year": 2015, "Median amount (£)": 209500, "Index": "House price"},
        {"Year": 2016, "Median amount (£)": 220000, "Index": "House price"},
        {"Year": 2017, "Median amount (£)": 230250, "Index": "House price"},
        {"Year": 2018, "Median amount (£)": 239950, "Index": "House price"},
        {"Year": 2019, "Median amount (£)": 240000, "Index": "House price"},
        {"Year": 1999, "Median amount (£)": 17939, "Index": "Earnings"},
        {"Year": 2000, "Median amount (£)": 19107, "Index": "Earnings"},
        {"Year": 2001, "Median amount (£)": 19997, "Index": "Earnings"},
        {"Year": 2002, "Median amount (£)": 20706, "Index": "Earnings"},
        {"Year": 2003, "Median amount (£)": 21500, "Index": "Earnings"},
        {"Year": 2004, "Median amount (£)": 22418, "Index": "Earnings"},
        {"Year": 2005, "Median amount (£)": 23280, "Index": "Earnings"},
        {"Year": 2006, "Median amount (£)": 23729, "Index": "Earnings"},
        {"Year": 2007, "Median amount (£)": 24480, "Index": "Earnings"},
        {"Year": 2008, "Median amount (£)": 25549, "Index": "Earnings"},
        {"Year": 2009, "Median amount (£)": 26133, "Index": "Earnings"},
        {"Year": 2010, "Median amount (£)": 26265, "Index": "Earnings"},
        {"Year": 2011, "Median amount (£)": 26488, "Index": "Earnings"},
        {"Year": 2012, "Median amount (£)": 26822, "Index": "Earnings"},
        {"Year": 2013, "Median amount (£)": 27372, "Index": "Earnings"},
        {"Year": 2014, "Median amount (£)": 27485, "Index": "Earnings"},
        {"Year": 2015, "Median amount (£)": 27841, "Index": "Earnings"},
        {"Year": 2016, "Median amount (£)": 28496, "Index": "Earnings"},
        {"Year": 2017, "Median amount (£)": 29083, "Index": "Earnings"},
        {"Year": 2018, "Median amount (£)": 29856, "Index": "Earnings"},
        {"Year": 2019, "Median amount (£)": 30667, "Index": "Earnings"}
      ]
    },
    {
      "name": "data_0",
      "source": "data-e030dd797eff50d18299f8a5494a1ffc",
      "transform": [
        {
          "type": "formula",
          "expr": "datum[\"Index\"]===\"House price\" ? 0 : 1",
          "as": "color_Index_sort_index"
        }
      ]
    }
  ],
  "marks": [
    {
      "name": "pathgroup",
      "type": "group",
      "from": {
        "facet": {
          "name": "faceted_path_main",
          "data": "data_0",
          "groupby": ["Index"]
        }
      },
      "encode": {
        "update": {
          "width": {"field": {"group": "width"}},
          "height": {"field": {"group": "height"}}
        }
      },
      "marks": [
        {
          "name": "marks",
          "type": "line",
          "style": ["line"],
          "sort": {"field": "datum[\"Year\"]"},
          "from": {"data": "faceted_path_main"},
          "encode": {
            "update": {
              "opacity": {"value": 0.8},
              "stroke": {"scale": "color", "field": "Index"},
              "x": {"scale": "x", "field": "Year"},
              "y": {"scale": "y", "field": "Median amount (£)"},
              "defined": {
                "signal": "isValid(datum[\"Median amount (£)\"]) && isFinite(+datum[\"Median amount (£)\"])"
              }
            }
          }
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "x",
      "type": "point",
      "domain": {"data": "data_0", "field": "Year", "sort": true},
      "range": [0, {"signal": "width"}],
      "padding": 0.5
    },
    {
      "name": "y",
      "type": "linear",
      "domain": [0, 500000],
      "range": [{"signal": "height"}, 0],
      "nice": true,
      "zero": true
    },
    {
      "name": "color",
      "type": "ordinal",
      "domain": {
        "data": "data_0",
        "field": "Index",
        "sort": {"op": "min", "field": "color_Index_sort_index"}
      },
      "range": ["#c5741d", "#265886"]
    }
  ],
  "axes": [
    {
      "scale": "y",
      "orient": "left",
      "gridScale": "x",
      "grid": true,
      "tickCount": {"signal": "ceil(height/40)"},
      "domain": false,
      "labels": false,
      "maxExtent": 0,
      "minExtent": 0,
      "ticks": false,
      "zindex": 0
    },
    {
      "scale": "x",
      "orient": "bottom",
      "grid": false,
      "labelAlign": "right",
      "labelBaseline": "middle",
      "labelOverlap": true,
      "zindex": 0
    },
    {
      "scale": "y",
      "orient": "left",
      "grid": false,
      "title": "Median amount (£)",
      "labelOverlap": true,
      "tickCount": {"signal": "ceil(height/40)"},
      "zindex": 0
    }
  ],
  "legends": [
    {
      "stroke": "color",
      "encode": {"symbols": {"update": {"opacity": {"value": 0.8}}}}
    }
  ],
  "config": {
    "axisX": {
      "domain": true,
      "domainColor": "#9E9EA3",
      "domainWidth": 1,
      "grid": false,
      "labelFont": "Raleway, sans-serif",
      "labelFontSize": 12,
      "labelPadding": 10,
      "labelColor": "#3c3f42",
      "labelFontWeight": 100,
      "tickColor": "#9E9EA3",
      "tickSize": 5,
      "titleFont": "Playfair Display, serif",
      "titleFontSize": 14,
      "titleFontWeight": 80,
      "titlePadding": 10,
      "titleColor": "#3c3f42",
      "labelAngle": -65
    },
    "axisY": {
      "domain": false,
      "grid": true,
      "gridColor": "#D1D4D6",
      "gridWidth": 1,
      "labelFont": "Raleway, sans-serif",
      "labelFontSize": 12,
      "labelPadding": 10,
      "labelColor": "#3c3f42",
      "labelFontWeight": 100,
      "ticks": false,
      "titleFont": "Playfair Display, serif",
      "titleFontSize": 16,
      "titleFontWeight": 600,
      "titleColor": "#3c3f42",
      "titleY": -15,
      "titleX": -10,
      "titlePadding": 10,
      "titleAngle": 0
    },
    "legend": {
      "labelFont": "Raleway, sans-serif",
      "labelFontSize": 14,
      "orient": "top-left",
      "labelColor": "#3c3f42",
      "labelFontWeight": 100,
      "symbolType": "square",
      "titleFont": "Raleway, sans-serif",
      "titleFontSize": 12,
      "title": ""
    },
    "style": {
      "cell": {"strokeWidth": 0},
      "group-title": {
        "fontSize": 15,
        "font": "Playfair Display, serif",
        "fontWeight": 600,
        "fill": "#3c3f42"
      }
    },
    "range": {
      "category": [
        "#06063c",
        "#c5741d",
        "#902727",
        "#265886",
        "#dab312",
        "#544567",
        "#3a5240",
        "#587f38",
        "#144050"
      ]
    }
  }
}