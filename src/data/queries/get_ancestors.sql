WITH RECURSIVE ancestors AS (

    -- Basisfall: direkte Source-Nodes der Ziel-Node
    SELECT n.id,
           n.type,
           n.position,
           n.data,
           1 AS depth
    FROM nodes n
             INNER JOIN edges e ON n.id = e.source
    WHERE e.target = :node_id
      AND (:source_handle IS NULL OR e.source_handle = :source_handle)

    UNION ALL

    -- Rekursiver Fall: stoppt wenn aktuelle Node eine Merge Node ist
    SELECT n.id,
           n.type,
           n.position,
           n.data,
           a.depth + 1
    FROM nodes n
             INNER JOIN edges e ON n.id = e.source
             INNER JOIN ancestors a ON e.target = a.id
    WHERE a.type != 'mergeNode')
SELECT id, type, position, data, MIN(depth) AS depth
FROM ancestors
GROUP BY id, type, position, data
ORDER BY depth;