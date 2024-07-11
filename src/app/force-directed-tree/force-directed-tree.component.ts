import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  image: string;
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

  private svg: any;
  private icons: any;


  constructor(
    private el: ElementRef,
    private http: HttpClient
    ) { }

  ngOnInit(): void {
    this.http.get('assets/icons.json').subscribe((icons) => {
      this.icons = icons;
      console.log(this.icons);
      this.createForceDirectedTree();
    });
  }

  createForceDirectedTree(): void {
    const element = this.el.nativeElement;
    const width = 1920;
    const height = 1080;

    const nodes: Node[] = [
      { id: 'A', image: this.icons['A'] , title: 'Роутер' },
      { id: 'B', image: this.icons['B'], title: 'Интернет'},
      { id: 'C', image: '../../assets/icons/edit.svg', title: 'Сервер' },
      { id: 'D1', image: '../../assets/icons/svgserv.svg', title: 'ПК' },
      { id: 'D2', image: '../../assets/icons/svgserv.svg', title: 'ПК' },
      { id: 'D3', image: '../../assets/icons/svgserv.svg', title: 'ПК' },
      { id: 'E1', image: '../../assets/icons/svgserv.svg', title: 'Ноутбук' },
      { id: 'E2', image: '../../assets/icons/svgserv.svg', title: 'Ноутбук' },
      { id: 'E3', image: '../../assets/icons/svgserv.svg', title: 'Ноутбук' },
      { id: 'G1', image: this.icons['B'], title:  'Switch' },
      { id: 'G2', image: this.icons['B'], title:  'Switch' },
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

    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id((d: Node) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: Link) => {
        return d.style === 'dashed' ? 2 : 4;
      })
      .attr('stroke-dasharray', (d: Link) => {
        return d.style === 'dashed' ? '5,5' : 'none';
      });

    const node = this.svg.append('g')
    .selectAll('image')
    .data(nodes)
    .enter().append('image')
    .attr('xlink:href', (d: { image: any; }) => d.image)
    .attr('width', 40)
    .attr('height', 40)
    .attr('x', (d: Node) => d.x ? d.x - 20 : 0)
    .attr('y', (d: Node) => d.y ? d.y - 20 : 0)
    .call(d3.drag<SVGImageElement, Node>()
      .on('start', (event, d) => this.dragstarted(event, d, simulation))
      .on('drag', (event, d) => this.dragged(event, d))
      .on('end', (event, d) => this.dragended(event, d, simulation)));

    const text = this.svg.append('g')
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

  saveAsSvg(): void {
    const svg = document.querySelector('svg');
    if (svg) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);

      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'graph.svg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }




}

