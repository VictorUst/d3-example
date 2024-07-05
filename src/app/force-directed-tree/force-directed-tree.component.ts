import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  icon: string;
  title: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  style?: string;
}

@Component({
  selector: 'app-force-directed-tree',
  templateUrl: './force-directed-tree.component.html',
  styleUrls: ['./force-directed-tree.component.scss']
})
export class ForceDirectedTreeComponent implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.createForceDirectedTree();
  }

  createForceDirectedTree(): void {
    const element = this.el.nativeElement;
    const width = 1920;
    const height = 1080;

    const svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);

    const nodes: Node[] = [
      { id: 'A', icon: '../../assets/icons/router.png', title: 'Роутер' },
      { id: 'B', icon: '../../assets/icons/internet.png', title: 'Интернет'},
      { id: 'C', icon: '../../assets/icons/server.png', title: 'Сервер' },
      { id: 'D1', icon: '../../assets/icons/desktop.png', title: 'ПК' },
      { id: 'D2', icon: '../../assets/icons/desktop.png', title: 'ПК' },
      { id: 'D3', icon: '../../assets/icons/desktop.png', title: 'ПК' },
      { id: 'E1', icon: '../../assets/icons/laptop.jpg', title: 'Ноутбук' },
      { id: 'E2', icon: '../../assets/icons/laptop.jpg', title: 'Ноутбук' },
      { id: 'E3', icon: '../../assets/icons/laptop.jpg', title: 'Ноутбук' },
      { id: 'G1', icon: '../../assets/icons/switch.png', title:  'Switch' },
      { id: 'G2', icon: '../../assets/icons/switch.png', title:  'Switch' },
    ];

    const links: Link[] = [
      { source: 'A', target: 'B',  style: 'dashed' },
      { source: 'A', target: 'C',  style: 'dashed' },
      { source: 'A', target: 'G1', style: 'solid' },
      { source: 'G1', target: 'G2', style: 'solid' },
      { source: 'G1', target: 'D1', style: 'dashed'  },
      { source: 'G1', target: 'D2', style: 'dashed'  },
      { source: 'G1', target: 'D3', style: 'dashed'  },
      { source: 'G2', target: 'E1', style: 'dashed'  },
      { source: 'G2', target: 'E2', style: 'dashed'  },
      { source: 'G2', target: 'E3', style: 'dashed'  }
    ];

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id((d: Node) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999') // Установка цвета линий
      .attr('stroke-opacity', 0.6) // Установка прозрачности линий
      .attr('stroke-width', (d: Link) => {
        return d.style === 'dashed' ? 2 : 4; // Толщина линии в зависимости от стиля
      })
      .attr('stroke-dasharray', (d: Link) => {
        return d.style === 'dashed' ? '5,5' : 'none'; // Если стиль dashed, то пунктирная линия
      });

    const node = svg.append('g')
    .selectAll('image')
    .data(nodes)
    .enter().append('image')
    .attr('xlink:href', d => d.icon) // Используем путь к изображению из данных узла
    .attr('width', 40) // Ширина изображения
    .attr('height', 40) // Высота изображения
    .attr('x', (d: Node) => d.x ? d.x - 20 : 0)
    .attr('y', (d: Node) => d.y ? d.y - 20 : 0)
    .call(d3.drag<SVGImageElement, Node>() // Указываем явно типы данных для drag
      .on('start', (event, d) => this.dragstarted(event, d, simulation))
      .on('drag', (event, d) => this.dragged(event, d))
      .on('end', (event, d) => this.dragended(event, d, simulation)));

    const text = svg.append('g')
      .attr('class', 'texts')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('dy', 5)
      .attr('dx', 20)
      .text((d: Node) => d.title)
      .style('font-size', '12px')
      .style('fill', '#333');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: Link) => {
          const sourceNode = d.source as Node;
          return sourceNode.x ?? 0;
        })
        .attr('y1', (d: Link) => {
          const sourceNode = d.source as Node;
          return sourceNode.y ?? 0;
        })
        .attr('x2', (d: Link) => {
          const targetNode = d.target as Node;
          return targetNode.x ?? 0;
        })
        .attr('y2', (d: Link) => {
          const targetNode = d.target as Node;
          return targetNode.y ?? 0;
        });

      node
        .attr('x', (d: Node) => d.x ? d.x - 20 : 0)
        .attr('y', (d: Node) => d.y ? d.y - 20 : 0);

      text
        .attr('x', (d: Node) => d.x ?? 0)
        .attr('y', (d: Node) => d.y ?? 0);
    });
  }

  dragstarted(event: any, d: Node, simulation: d3.Simulation<Node, Link>): void {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event: any, d: Node): void {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event: any, d: Node, simulation: d3.Simulation<Node, Link>): void {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}
