const { session } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// @desc    Create new incident
// @route   POST /api/v1/incidents
exports.createIncident = async (req, res) => {
  const s = session();
  const id = uuidv4();
  const {
    title, crimeType, description, date, time, status,
    locationName, barangay, suspectName, victimName, officerName
  } = req.body;

  try {
    const result = await s.run(
      `MERGE (i:Incident {incidentId: $id})
       SET i.title = $title,
           i.description = $description,
           i.date = $date,
           i.time = $time,
           i.status = $status
       
       MERGE (ct:CrimeType {name: $crimeType})
       MERGE (i)-[:HAS_TYPE]->(ct)
       
       MERGE (l:Location {name: $locationName, barangay: $barangay})
       MERGE (i)-[:OCCURRED_AT]->(l)
       
       MERGE (s:Suspect {name: $suspectName})
       MERGE (s)-[:INVOLVED_IN]->(i)
       
       MERGE (v:Victim {name: $victimName})
       MERGE (v)-[:AFFECTED_BY]->(i)
       
       MERGE (o:Officer {name: $officerName})
       MERGE (o)-[:HANDLED]->(i)
       
       WITH i
       CREATE (n:Notification {
         notificationId: $notificationId,
         title: 'New Incident Reported',
         message: 'A new ' + $crimeType + ' has been reported at ' + $locationName,
         type: 'new_incident',
         incidentId: $id,
         createdAt: $createdAt
       })
       WITH i, n
       MATCH (u:User)
       CREATE (u)-[:HAS_NOTIFICATION {read: false}]->(n)
       
       RETURN i`,
      {
        id: id,
        notificationId: uuidv4(),
        createdAt: new Date().toISOString(),
        title: title || "",
        description: description || "",
        date: date || "",
        time: time || "",
        status: status || "Pending",
        crimeType: crimeType || "Unknown",
        locationName: locationName || "Unknown",
        barangay: barangay || "Unknown",
        suspectName: suspectName || "Unknown",
        victimName: victimName || "Unknown",
        officerName: officerName || "Unknown"
      }
    );

    res.status(201).json({
      success: true,
      data: result.records[0].get('i').properties
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Get all incidents
// @route   GET /api/v1/incidents
exports.getAllIncidents = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[:HAS_TYPE]->(ct:CrimeType)
      OPTIONAL MATCH (i)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (s:Suspect)-[:INVOLVED_IN]->(i)
      OPTIONAL MATCH (v:Victim)-[:AFFECTED_BY]->(i)
      OPTIONAL MATCH (o:Officer)-[:HANDLED]->(i)
      RETURN i, ct.name as crimeType, l.name as location, s.name as suspect, v.name as victim, o.name as officer
      ORDER BY i.date DESC, i.time DESC
    `);

    const incidents = result.records.map(record => ({
      ...record.get('i').properties,
      crimeType: record.get('crimeType'),
      locationName: record.get('location'),
      suspectName: record.get('suspect'),
      victimName: record.get('victim'),
      officerName: record.get('officer')
    }));

    res.status(200).json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Get single incident
// @route   GET /api/v1/incidents/:id
exports.getIncident = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (i:Incident {incidentId: $id})
      OPTIONAL MATCH (i)-[:HAS_TYPE]->(ct:CrimeType)
      OPTIONAL MATCH (i)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (s:Suspect)-[:INVOLVED_IN]->(i)
      OPTIONAL MATCH (v:Victim)-[:AFFECTED_BY]->(i)
      OPTIONAL MATCH (o:Officer)-[:HANDLED]->(i)
      RETURN i, ct.name as crimeType, l.name as location, l.barangay as barangay, 
             s.name as suspect, v.name as victim, o.name as officer
    `, { id: req.params.id });

    if (result.records.length === 0) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const record = result.records[0];
    const data = {
      ...record.get('i').properties,
      crimeType: record.get('crimeType'),
      locationName: record.get('location'),
      barangay: record.get('barangay'),
      suspectName: record.get('suspect'),
      victimName: record.get('victim'),
      officerName: record.get('officer')
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Update incident
// @route   PUT /api/v1/incidents/:id
exports.updateIncident = async (req, res) => {
  const s = session();
  const id = req.params.id;
  const {
    title, crimeType, description, date, time, status,
    locationName, barangay, suspectName, victimName, officerName
  } = req.body;

  try {
    await s.run(`
        MATCH (i:Incident {incidentId: $id})
        SET i.title = $title,
            i.description = $description,
            i.date = $date,
            i.time = $time,
            i.status = $status

        // Update CrimeType
        WITH i
        OPTIONAL MATCH (i)-[r1:HAS_TYPE]->(:CrimeType)
        DELETE r1
        MERGE (ct:CrimeType {name: $crimeType})
        MERGE (i)-[:HAS_TYPE]->(ct)

        // Update Location
        WITH i
        OPTIONAL MATCH (i)-[r2:OCCURRED_AT]->(:Location)
        DELETE r2
        MERGE (l:Location {name: $locationName, barangay: $barangay})
        MERGE (i)-[:OCCURRED_AT]->(l)

        // Update Suspect
        WITH i
        OPTIONAL MATCH (:Suspect)-[r3:INVOLVED_IN]->(i)
        DELETE r3
        MERGE (s:Suspect {name: $suspectName})
        MERGE (s)-[:INVOLVED_IN]->(i)

        // Update Victim
        WITH i
        OPTIONAL MATCH (:Victim)-[r4:AFFECTED_BY]->(i)
        DELETE r4
        MERGE (v:Victim {name: $victimName})
        MERGE (v)-[:AFFECTED_BY]->(i)

        // Update Officer
        WITH i
        OPTIONAL MATCH (:Officer)-[r5:HANDLED]->(i)
        DELETE r5
        MERGE (o:Officer {name: $officerName})
        MERGE (o)-[:HANDLED]->(i)

        RETURN i
      `, {
        id: id,
        title: title || "",
        description: description || "",
        date: date || "",
        time: time || "",
        status: status || "Pending",
        crimeType: crimeType || "Unknown",
        locationName: locationName || "Unknown",
        barangay: barangay || "Unknown",
        suspectName: suspectName || "Unknown",
        victimName: victimName || "Unknown",
        officerName: officerName || "Unknown"
      }
    );

    res.status(200).json({ success: true, message: 'Incident updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Delete incident
// @route   DELETE /api/v1/incidents/:id
exports.deleteIncident = async (req, res) => {
  const s = session();
  try {
    await s.run(`
      MATCH (i:Incident {incidentId: $id})
      DETACH DELETE i
    `, { id: req.params.id });
    res.status(200).json({ success: true, message: 'Incident deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Search incidents
// @route   GET /api/v1/incidents/search/:keyword
exports.searchIncidents = async (req, res) => {
  const s = session();
  const keyword = req.params.keyword;
  try {
    const result = await s.run(`
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[:HAS_TYPE]->(ct:CrimeType)
      OPTIONAL MATCH (i)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (s:Suspect)-[:INVOLVED_IN]->(i)
      OPTIONAL MATCH (v:Victim)-[:AFFECTED_BY]->(i)
      OPTIONAL MATCH (o:Officer)-[:HANDLED]->(i)
      WHERE 
        toLower(i.title) CONTAINS toLower($keyword) OR 
        toLower(i.description) CONTAINS toLower($keyword) OR 
        toLower(ct.name) CONTAINS toLower($keyword) OR 
        toLower(l.name) CONTAINS toLower($keyword) OR 
        toLower(l.barangay) CONTAINS toLower($keyword) OR 
        toLower(s.name) CONTAINS toLower($keyword) OR 
        toLower(v.name) CONTAINS toLower($keyword) OR 
        toLower(o.name) CONTAINS toLower($keyword) OR
        toLower(i.date) CONTAINS toLower($keyword) OR
        toLower(i.time) CONTAINS toLower($keyword)
      RETURN i, ct.name as crimeType, l.name as locationName, s.name as suspectName, v.name as victimName, o.name as officerName
    `, { keyword });

    const incidents = result.records.map(record => ({
      ...record.get('i').properties,
      crimeType: record.get('crimeType'),
      locationName: record.get('locationName'),
      suspectName: record.get('suspectName'),
      victimName: record.get('victimName'),
      officerName: record.get('officerName')
    }));

    res.status(200).json({ success: true, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Dashboard stats
// @route   GET /api/v1/incidents/dashboard/stats
exports.getStats = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (i:Incident)
      WITH count(i) as total
      
      OPTIONAL MATCH (i1:Incident {status: 'Active'})
      WITH total, count(i1) as active
      
      OPTIONAL MATCH (i2:Incident {status: 'Solved'})
      WITH total, active, count(i2) as solved
      
      OPTIONAL MATCH (i:Incident)-[:HAS_TYPE]->(ct:CrimeType)
      RETURN total, active, solved, ct.name as type, count(i) as typeCount
    `);

    const stats = {
      total: result.records[0]?.get('total').toInt() || 0,
      active: result.records[0]?.get('active').toInt() || 0,
      solved: result.records[0]?.get('solved').toInt() || 0,
      byType: result.records
        .filter(r => r.get('type') !== null)
        .map(r => ({
          name: r.get('type'),
          value: r.get('typeCount').toInt()
        }))
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Get all unique crime types
// @route   GET /api/v1/incidents/types/list
exports.getCrimeTypes = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (ct:CrimeType)
      RETURN ct.name as name
      ORDER BY ct.name ASC
    `);

    const types = result.records.map(r => r.get('name'));
    res.status(200).json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Backup download
// @route   GET /api/v1/incidents/backup/download
exports.downloadBackup = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[:HAS_TYPE]->(ct:CrimeType)
      OPTIONAL MATCH (i)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (s:Suspect)-[:INVOLVED_IN]->(i)
      OPTIONAL MATCH (v:Victim)-[:AFFECTED_BY]->(i)
      OPTIONAL MATCH (o:Officer)-[:HANDLED]->(i)
      RETURN i, ct.name as crimeType, l.name as location, l.barangay as barangay, 
             s.name as suspect, v.name as victim, o.name as officer
    `);

    const data = result.records.map(record => ({
      ...record.get('i').properties,
      crimeType: record.get('crimeType'),
      location: record.get('location'),
      barangay: record.get('barangay'),
      suspect: record.get('suspect'),
      victim: record.get('victim'),
      officer: record.get('officer')
    }));

    res.setHeader('Content-disposition', 'attachment; filename=incidents_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(data, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await s.close();
  }
};

// @desc    Get data formatted for graph visualization
// @route   GET /api/v1/incidents/graph/data
exports.getGraphData = async (req, res) => {
  const s = session();
  try {
    const result = await s.run(`
      MATCH (i:Incident)
      OPTIONAL MATCH (i)-[r1:HAS_TYPE]->(ct:CrimeType)
      OPTIONAL MATCH (i)-[r2:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (s:Suspect)-[r3:INVOLVED_IN]->(i)
      OPTIONAL MATCH (v:Victim)-[r4:AFFECTED_BY]->(i)
      OPTIONAL MATCH (o:Officer)-[r5:HANDLED]->(i)
      RETURN i, ct, l, s, v, o
    `);
    
    const nodes = [];
    const links = [];
    const nodeIds = new Set();

    const addNode = (id, label, name) => {
      if (!id || nodeIds.has(id)) return;
      nodeIds.add(id);
      nodes.push({ id, label, name });
    };

    result.records.forEach(record => {
      const i = record.get('i').properties;
      const incidentId = i.incidentId;
      addNode(incidentId, 'Incident', i.title);

      const entities = [
        { key: 's', label: 'Suspect', rel: 'INVOLVED_IN', targetId: incidentId, reverse: true },
        { key: 'v', label: 'Victim', rel: 'AFFECTED_BY', targetId: incidentId, reverse: true },
        { key: 'o', label: 'Officer', rel: 'HANDLED_BY', targetId: incidentId, reverse: true },
        { key: 'l', label: 'Location', rel: 'OCCURRED_AT', targetId: incidentId, reverse: false },
        { key: 'ct', label: 'CrimeType', rel: 'HAS_TYPE', targetId: incidentId, reverse: false }
      ];

      entities.forEach(entity => {
        const node = record.get(entity.key);
        if (node) {
          const props = node.properties;
          const entityId = `${entity.label}-${props.name}`;
          addNode(entityId, entity.label, props.name);
          
          if (entity.reverse) {
            links.push({ source: entityId, target: entity.targetId, label: entity.rel });
          } else {
            links.push({ source: entity.targetId, target: entityId, label: entity.rel });
          }
        }
      });
    });

    res.json({ success: true, data: { nodes, links } });
  } catch (error) {
    console.error('Graph Data Error:', error);
    res.status(500).json({ error: 'Failed to fetch graph data' });
  } finally {
    await s.close();
  }
};
