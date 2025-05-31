import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../../styles/VisualRecon.css';

const DeepVisualRecon = () => {
  const svgRef = useRef();
  const [apexDomain, setApexDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkData, setNetworkData] = useState(null);
  const [error, setError] = useState('');
  const [visibleTypes, setVisibleTypes] = useState({
    apex: true,
    subdomain: true,
    url: true,
    asn: true,
    cidr: true
  });

  // Fetch network data for an apex domain
  const fetchNetworkData = async (domain) => {
    if (!domain) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/deeper/visual-recon/${encodeURIComponent(domain)}`);
      if (!response.ok) throw new Error('Failed to fetch network data');
      const data = await response.json();
      setNetworkData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching network data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLegendClick = (type) => {
    setVisibleTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Create the network diagram
  useEffect(() => {
    if (!networkData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous diagram

    const width = 1200;
    const height = 800;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr("width", width).attr("height", height);

    // Create nodes and links from network data
    const nodes = [];
    const links = [];

    // Node types and their properties
    const nodeTypes = {
      apex: { color: '#ff6b6b', size: 12, label: 'Apex Domain' },
      subdomain: { color: '#4ecdc4', size: 8, label: 'Subdomain' },
      url: { color: '#45b7d1', size: 6, label: 'URL' },
      asn: { color: '#96ceb4', size: 10, label: 'ASN' },
      cidr: { color: '#feca57', size: 9, label: 'CIDR' }
    };

    // Add apex domain node
    nodes.push({
      id: `apex-${networkData.apex.id}`,
      name: networkData.apex.domain,
      type: 'apex',
      data: networkData.apex
    });

    // Add subdomain nodes and links
    networkData.subdomains?.forEach(subdomain => {
      const nodeId = `subdomain-${subdomain.id}`;
      nodes.push({
        id: nodeId,
        name: subdomain.subdomain,
        type: 'subdomain',
        data: subdomain
      });

      links.push({
        source: `apex-${networkData.apex.id}`,
        target: nodeId,
        type: 'apex-subdomain'
      });
    });

    // Add URL nodes and links
    networkData.urls?.forEach(url => {
      const nodeId = `url-${url.id}`;
      nodes.push({
        id: nodeId,
        name: new URL(url.url).pathname || '/',
        type: 'url',
        data: url
      });

      links.push({
        source: `subdomain-${url.fk_subdomains_id}`,
        target: nodeId,
        type: 'subdomain-url'
      });
    });

    // Add ASN nodes and links
    networkData.asns?.forEach(asn => {
      const nodeId = `asn-${asn.id}`;
      nodes.push({
        id: nodeId,
        name: `AS${asn.asn}`,
        type: 'asn',
        data: asn
      });

      // Link ASN to apex domain
      links.push({
        source: `apex-${networkData.apex.id}`,
        target: nodeId,
        type: 'apex-asn'
      });
    });

    // Add CIDR nodes and links
    networkData.cidrs?.forEach(cidr => {
      const nodeId = `cidr-${cidr.id}`;
      nodes.push({
        id: nodeId,
        name: cidr.cidr_range,
        type: 'cidr',
        data: cidr
      });

      // Link CIDR to apex domain
      links.push({
        source: `apex-${networkData.apex.id}`,
        target: nodeId,
        type: 'apex-cidr'
      });

      // Link CIDR to subdomains if they're in the same IP range
      networkData.subdomains?.forEach(subdomain => {
        if (subdomain.ip_address && cidr.contains_ip) {
          links.push({
            source: nodeId,
            target: `subdomain-${subdomain.id}`,
            type: 'cidr-subdomain'
          });
        }
      });
    });

    // Find the apex node id
    const apexNode = nodes.find(n => n.type === 'apex');
    const filteredNodes = nodes.filter(n => visibleTypes[n.type]);
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = links.filter(l => {
      // Always show links from apex to any node
      if (apexNode && (l.source.id === apexNode.id || l.source === apexNode.id)) {
        return true;
      }
      // Otherwise, only show if both ends are visible
      return filteredNodeIds.has(l.source.id || l.source) && filteredNodeIds.has(l.target.id || l.target);
    });

    // Create force simulation
    const simulation = d3.forceSimulation(filteredNodes)
      .force("link", d3.forceLink(filteredLinks).id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => nodeTypes[d.type].size + 5));

    // Create container group
    const container = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create links
    const link = container
      .selectAll(".link")
      .data(filteredLinks)
      .enter()
      .append("line")
      .attr("class", d => {
        // If this is a link from apex to a hidden node, add a special class
        if (
          apexNode &&
          (d.source.id === apexNode.id || d.source === apexNode.id) &&
          !filteredNodeIds.has(d.target.id || d.target)
        ) {
          return "link visual-recon-link-dangling";
        }
        return "link";
      })
      .style("stroke", "#999")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", 2)
      .style("stroke-dasharray", d => {
        // Dashed for dangling links
        if (
          apexNode &&
          (d.source.id === apexNode.id || d.source === apexNode.id) &&
          !filteredNodeIds.has(d.target.id || d.target)
        ) {
          return "6,4";
        }
        return null;
      });

    // Create nodes
    const node = container
      .selectAll(".node")
      .data(filteredNodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Add circles for nodes
    node.append("circle")
      .attr("r", d => nodeTypes[d.type].size)
      .style("fill", d => nodeTypes[d.type].color)
      .style("stroke", "#fff")
      .style("stroke-width", 2);

    // Add labels
    node.append("text")
      .attr("dx", d => nodeTypes[d.type].size + 5)
      .attr("dy", ".35em")
      .style("font-size", "12px")
      .style("fill", "#333")
      .text(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name);

    // Add tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("font-size", "12px");

    node.on("mouseover", (event, d) => {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(`
        <strong>${nodeTypes[d.type].label}</strong><br/>
        ${d.name}<br/>
        ${d.type === 'subdomain' && d.data.ip_address ? `IP: ${d.data.ip_address}` : ''}
        ${d.type === 'asn' && d.data.names ? `Names: ${d.data.names.join(', ')}` : ''}
        ${d.type === 'url' ? `Full URL: ${d.data.url}` : ''}
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tooltip.transition().duration(500).style("opacity", 0);
    });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Cleanup function
    return () => {
      tooltip.remove();
    };

  }, [networkData, visibleTypes]);

  return (
    <div className="visual-recon-container">
      <div className="visual-recon-header">
        <h2 className="visual-recon-title">Reconnaissance Network Diagram</h2>
        <div className="visual-recon-controls">
          <input
            type="text"
            value={apexDomain}
            onChange={(e) => setApexDomain(e.target.value)}
            placeholder="Enter apex domain (e.g., example.com)"
            className="visual-recon-input"
            onKeyPress={(e) => e.key === 'Enter' && fetchNetworkData(apexDomain)}
          />
          <button
            onClick={() => fetchNetworkData(apexDomain)}
            disabled={loading || !apexDomain}
            className="visual-recon-btn"
          >
            {loading ? 'Loading...' : 'Generate Diagram'}
          </button>
        </div>
        {error && <div className="visual-recon-error">Error: {error}</div>}
      </div>

      {/* Legend */}
      {networkData && (
        <div className="visual-recon-legend-section">
          <h4 className="visual-recon-legend-title">Legend:</h4>
          <div className="visual-recon-legend">
            {Object.entries({
              apex: { color: '#ff6b6b', label: 'Apex Domain' },
              subdomain: { color: '#4ecdc4', label: 'Subdomains' },
              url: { color: '#45b7d1', label: 'URLs' },
              asn: { color: '#96ceb4', label: 'ASNs' },
              cidr: { color: '#feca57', label: 'CIDR Ranges' }
            }).map(([key, value]) => (
              <div
                key={key}
                className={`visual-recon-legend-item${visibleTypes[key] ? '' : ' visual-recon-legend-item--disabled'}`}
                style={{ borderColor: value.color }}
                tabIndex={0}
                role="button"
                aria-pressed={visibleTypes[key]}
                onClick={() => handleLegendClick(key)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleLegendClick(key)}
                title={`Toggle ${value.label}`}
              >
                <span
                  className="visual-recon-legend-dot"
                  style={{ backgroundColor: value.color }}
                />
                <span className="visual-recon-legend-label">{value.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SVG Container */}
      <div className="visual-recon-svg-wrapper">
        <svg ref={svgRef} className="visual-recon-svg"></svg>
      </div>

      {/* Instructions */}
      <div className="visual-recon-instructions">
        <p><strong>Instructions:</strong></p>
        <ul>
          <li>Enter an apex domain and click "Generate Diagram" to see its network relationships</li>
          <li>Drag nodes to rearrange the diagram</li>
          <li>Use mouse wheel to zoom in/out</li>
          <li>Hover over nodes for additional information</li>
        </ul>
      </div>
    </div>
  );
};

export default DeepVisualRecon;
