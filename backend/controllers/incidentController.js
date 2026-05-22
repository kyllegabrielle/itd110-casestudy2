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
    const result = await s.writeTransaction(tx =>
      tx.run(`
        MERGE (i:Incident {incidentId: $id})
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

        RETURN i, ct, l, s, v, o
      `, {
        id, title, description, date, time, status,
        locationName, barangay, suspectName, victimName, officerName
      })
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
    await s.writeTransaction(tx =>
      tx.run(`
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
        id, title, description, date, time, status,
        locationName, barangay, suspectName, victimName, officerName
      })
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
      WHERE i.title CONTAINS $keyword OR i.description CONTAINS $keyword
      OPTIONAL MATCH (i)-[:HAS_TYPE]->(ct:CrimeType)
      RETURN i, ct.name as crimeType
    `, { keyword });

    const incidents = result.records.map(record => ({
      ...record.get('i').properties,
      crimeType: record.get('crimeType')
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
      WITH count(i) as totalIncidents
      MATCH (i:Incident)-[:HAS_TYPE]->(ct:CrimeType)
      RETURN totalIncidents, ct.name as type, count(i) as count
    `);

    const stats = {
      total: result.records[0]?.get('totalIncidents').toInt() || 0,
      byType: result.records.map(r => ({
        type: r.get('type'),
        count: r.get('count').toInt()
      }))
    };

    res.status(200).json({ success: true, data: stats });
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
