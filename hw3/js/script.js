const b_width = 900;
const d_width = 500;
const b_height = 850;
const d_height = 850;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

const radius = d3.scaleLinear().range([0.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_label = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip').style("opacity", 0.9);

const forceStrength = 0.03;

//  Part 1 - Создайте симуляцию с использованием forceCenter, forceX и forceCollide
const simulation = d3.forceSimulation()

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    // Part 1 - задайте domain  для шкал
    color.domain(ratings)
    radius.domain([d3.min(rating), d3.max(rating)])
    x.domain([d3.min(years), d3.max(years)]);

    // Part 1 - создайте circles на основе data
    // var nodes = bubble
        // .selectAll("circle")
    
        
        // ..
    // добавьте обработчики событий mouseover и mouseout
            // .on('mouseover', overBubble)
            // .on('mouseout', outOfBubble);

    // Part 1 - передайте данные в симуляцию и добавьте обработчик события tick
    simulation.nodes(data)
        .force('x', d3.forceX().x(function(d) { return x(+d['release year']);}))
        .force('center', d3.forceCenter(b_width / 2, b_height / 2))
        .force('collision', d3.forceCollide().radius(function(d) {
            return radius(d['user rating score']);}))
        .on('tick', ticked)
    
    function ticked() {
        var u = bubble
            .selectAll('circle')
            .data(data);

        u.enter()
            .append('circle')
            .attr("r", function(d) {return radius(d['user rating score']);})
            .attr("fill", function(d) { return color(d["rating"]); })
            .merge(u)
            .attr('cx', function(d) {
            return d.x;
            })
            .attr('cy', function(d) {
            return d.y;
            })
            .attr('stroke', 'black')
            .style('stroke-width', '0px')
            .on('mouseover', overBubble)
            .on('mouseout', outOfBubble)

        u.exit().remove();
        }

    function overBubble(d){
        console.log(d)

        // Part 2 - задайте stroke и stroke-width для выделяемого элемента   
        d3.select(this).style('stroke-width', '2px');
        
        // // Part 3 - обновите содержимое tooltip с использованием классов title и year
        var dx = d.x + (+d3.select(this).attr('r')) * 2
        tooltip.html("<b>" + d['title'] + "</b>" + "<br/>"  + d['release year'])	

        // Part 3 - измените display и позицию tooltip
        tooltip
            .style("left", dx + "px")
            .style("top", (d.y - 90) + "px")  
            .style('display', 'block')
    }

    function outOfBubble()
    {
      // Part 2 - обнулите stroke и stroke-width
      d3.select(this).style('stroke-width', '0px');
            
      // Part 3 - измените display у tooltip
      tooltip.style('display', 'none')
    }

    // Part 1 - Создайте шаблон при помощи d3.pie на основе ratings
    var pie = d3.pie().value(function(d) {return d.value.value; })
    var data_ready = pie(d3.entries(ratings))
    
    // Part 1 - Создайте генератор арок при помощи d3.arc
    // ..
    
    // Part 1 - постройте donut chart внутри donut
    // ..

    donut
    .selectAll('whatever')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', d3.arc()
        .innerRadius(150)         // This is the size of the donut hole
        .outerRadius(250)
    )
    .attr('fill', function(d){return(color(d.data.value.key))})
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .style("opacity", '1')
    .on('mouseover', overArc)
    .on('mouseout', outOfArc);

    // добавьте обработчики событий mouseover и mouseout
        //.on('mouseover', overArc)
        //.on('mouseout', outOfArc);

    function overArc(d){
        console.log(d)
        // Part 2 - измените содержимое donut_lable
        donut_label.text(d.data.value.key)

        // Part 2 - измените opacity арки
        d3.select(this).style('opacity', '0.5');

        var selected_rating = d.data.value.key
        console.log(selected_rating)
        // Part 3 - измените opacity, stroke и stroke-width для circles в зависимости от rating
        bubble.selectAll('circle')
            .style('opacity', function(d){
                if (d.rating == selected_rating)
                    return '1';
                else
                    return '0.5';
            })
            .style('stroke-width', function(d){
                if (d.rating == selected_rating)
                    return '2.5px';
                else
                    return '0px';
            })
    }
    function outOfArc(){
        // Part 2 - измените содержимое donut_lable
        d3.select(this).style('opacity', '1');

        // Part 2 - измените opacity арки
        donut_label.text('')

        // Part 3 - верните opacity, stroke и stroke-width для circles
        bubble.selectAll('circle')
            .style('opacity', '1')
            .style('stroke-width', '0px')
    }
});