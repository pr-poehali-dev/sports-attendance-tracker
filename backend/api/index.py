import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления спортсменами, группами и расписанием
    Args: event - dict с httpMethod, body, queryStringParameters
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    path: str = event.get('queryStringParameters', {}).get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            if path == 'athletes':
                cur.execute('''
                    SELECT a.id, a.name, a.group_name as "group", a.attendance, 
                           a.status, a.last_visit as "lastVisit"
                    FROM athletes a
                    ORDER BY a.id
                ''')
                athletes = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(list(athletes)),
                    'isBase64Encoded': False
                }
            
            elif path == 'groups':
                cur.execute('''
                    SELECT g.id, g.name, g.color,
                           COUNT(a.id) as count
                    FROM groups g
                    LEFT JOIN athletes a ON g.name = a.group_name
                    GROUP BY g.id, g.name, g.color
                    ORDER BY g.id
                ''')
                groups = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(list(groups)),
                    'isBase64Encoded': False
                }
            
            elif path == 'schedules':
                cur.execute('''
                    SELECT id, group_name as "group", day, time, duration
                    FROM schedules
                    ORDER BY id
                ''')
                schedules = cur.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(list(schedules)),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'athletes':
                cur.execute('''
                    INSERT INTO athletes (name, group_name, status, attendance, last_visit)
                    VALUES (%s, %s, %s, 0, 'Никогда')
                    RETURNING id, name, group_name as "group", attendance, status, last_visit as "lastVisit"
                ''', (body_data['name'], body_data['group'], body_data.get('status', 'active')))
                athlete = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(athlete)),
                    'isBase64Encoded': False
                }
            
            elif path == 'schedules':
                cur.execute('''
                    INSERT INTO schedules (group_name, day, time, duration)
                    VALUES (%s, %s, %s, %s)
                    RETURNING id, group_name as "group", day, time, duration
                ''', (body_data['group'], body_data['day'], body_data['time'], body_data['duration']))
                schedule = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(schedule)),
                    'isBase64Encoded': False
                }
            
            elif path == 'checkin':
                athlete_id = body_data['athleteId']
                cur.execute('''
                    UPDATE athletes 
                    SET last_visit = 'Сегодня'
                    WHERE id = %s
                    RETURNING id
                ''', (athlete_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            
            if path == 'athletes':
                cur.execute('''
                    UPDATE athletes
                    SET name = %s, group_name = %s, status = %s
                    WHERE id = %s
                    RETURNING id, name, group_name as "group", attendance, status, last_visit as "lastVisit"
                ''', (body_data['name'], body_data['group'], body_data['status'], body_data['id']))
                athlete = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(athlete)),
                    'isBase64Encoded': False
                }
            
            elif path == 'groups':
                cur.execute('''
                    UPDATE groups
                    SET name = %s, color = %s
                    WHERE id = %s
                    RETURNING id, name, color
                ''', (body_data['name'], body_data['color'], body_data['id']))
                group = cur.fetchone()
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(group)),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            if path == 'schedules':
                schedule_id = event.get('queryStringParameters', {}).get('id')
                cur.execute('UPDATE schedules SET group_name = NULL WHERE id = %s', (schedule_id,))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Not found'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
