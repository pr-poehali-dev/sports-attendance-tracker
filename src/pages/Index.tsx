import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const API_URL = 'https://functions.poehali.dev/96830027-650a-4751-9835-58f4cc80fe6d';

type Athlete = {
  id: number;
  name: string;
  group: string;
  attendance: number;
  status: 'active' | 'injured' | 'rest';
  lastVisit: string;
  checked?: boolean;
};

type Group = {
  id: number;
  name: string;
  count: number;
  color: string;
};

type Schedule = {
  id: number;
  group: string;
  day: string;
  time: string;
  duration: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-500';
    case 'injured': return 'bg-red-500';
    case 'rest': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'injured': return 'Травма';
    case 'rest': return 'Отдых';
    default: return '';
  }
};

const AthleteCard = memo(({ athlete, onCheckIn, onEdit }: {
  athlete: Athlete;
  onCheckIn: (id: number) => void;
  onEdit: (athlete: Athlete) => void;
}) => (
  <Card 
    className="p-4 transition-all hover:scale-[1.02] hover:shadow-lg border-l-4 will-change-transform"
    style={{ borderLeftColor: athlete.checked ? 'hsl(var(--primary))' : 'transparent' }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border-2 border-primary/50">
          <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
            {athlete.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{athlete.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{athlete.group}</Badge>
            <div className={`w-2 h-2 rounded-full ${getStatusColor(athlete.status)}`} />
            <span className="text-xs text-muted-foreground">{getStatusLabel(athlete.status)}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          size="icon"
          variant="ghost"
          onClick={() => onEdit(athlete)}
          className="rounded-full h-9 w-9"
        >
          <Icon name="Pencil" size={16} />
        </Button>
        <Button 
          size="icon"
          variant={athlete.checked ? "default" : "outline"}
          onClick={() => onCheckIn(athlete.id)}
          className="rounded-full"
        >
          <Icon name={athlete.checked ? "Check" : "UserPlus"} size={18} />
        </Button>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Посещаемость</span>
        <span className="font-semibold">{athlete.attendance}%</span>
      </div>
      <Progress value={athlete.attendance} className="h-2" />
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon name="Clock" size={12} />
        <span>Последний визит: {athlete.lastVisit}</span>
      </div>
    </div>
  </Card>
));

AthleteCard.displayName = 'AthleteCard';

const GroupCard = memo(({ group, onEdit, onViewSchedule }: { 
  group: Group;
  onEdit: (group: Group) => void;
  onViewSchedule: (groupName: string) => void;
}) => (
  <Card className="p-5 transition-all hover:scale-[1.02] hover:shadow-lg will-change-transform">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl ${group.color} flex items-center justify-center`}>
          <Icon name="Users" size={24} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{group.name}</h3>
          <p className="text-sm text-muted-foreground">{group.count} спортсменов</p>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit(group)}
        className="rounded-full"
      >
        <Icon name="Pencil" size={18} />
      </Button>
    </div>
    
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1" onClick={() => onViewSchedule(group.name)}>
        <Icon name="CalendarDays" size={14} className="mr-1" />
        Расписание
      </Button>
      <Button variant="outline" size="sm" className="flex-1">
        <Icon name="BarChart3" size={14} className="mr-1" />
        Статистика
      </Button>
    </div>
  </Card>
));

GroupCard.displayName = 'GroupCard';

const Index = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [athletesRes, groupsRes, schedulesRes] = await Promise.all([
        fetch(`${API_URL}?path=athletes`),
        fetch(`${API_URL}?path=groups`),
        fetch(`${API_URL}?path=schedules`)
      ]);
      
      const athletesData = await athletesRes.json();
      const groupsData = await groupsRes.json();
      const schedulesData = await schedulesRes.json();
      
      setAthletes(athletesData);
      setGroups(groupsData);
      setSchedules(schedulesData);
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showEditAthlete, setShowEditAthlete] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedGroupForSchedule, setSelectedGroupForSchedule] = useState<string>('');

  const [newAthlete, setNewAthlete] = useState({ name: '', group: '', status: 'active' as const });
  const [newSchedule, setNewSchedule] = useState({ group: '', day: '', time: '', duration: '' });

  const stats = useMemo(() => {
    const total = athletes.length;
    const today = athletes.filter(a => a.lastVisit === 'Сегодня').length;
    const avg = Math.round(athletes.reduce((acc, a) => acc + a.attendance, 0) / athletes.length);
    return { total, today, avg };
  }, [athletes]);

  const handleCheckIn = useCallback(async (id: number) => {
    try {
      await fetch(`${API_URL}?path=checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ athleteId: id })
      });
      
      setAthletes(prev => prev.map(a => 
        a.id === id ? { ...a, checked: !a.checked, lastVisit: 'Сегодня' } : a
      ));
    } catch (error) {
      toast.error('Ошибка отметки');
    }
  }, []);

  const handleAddAthlete = useCallback(async () => {
    if (!newAthlete.name || !newAthlete.group) {
      toast.error('Заполните все поля');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}?path=athletes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAthlete)
      });
      
      const athlete = await res.json();
      setAthletes(prev => [...prev, athlete]);
      await loadData();
      
      toast.success('Спортсмен добавлен');
      setNewAthlete({ name: '', group: '', status: 'active' });
      setShowAddAthlete(false);
    } catch (error) {
      toast.error('Ошибка добавления');
    }
  }, [newAthlete]);

  const handleEditAthlete = useCallback(async () => {
    if (!selectedAthlete) return;
    
    try {
      await fetch(`${API_URL}?path=athletes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAthlete)
      });
      
      setAthletes(prev => prev.map(a => 
        a.id === selectedAthlete.id ? selectedAthlete : a
      ));
      await loadData();
      
      toast.success('Изменения сохранены');
      setShowEditAthlete(false);
      setSelectedAthlete(null);
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  }, [selectedAthlete]);

  const handleEditGroup = useCallback(async () => {
    if (!selectedGroup) return;
    
    try {
      await fetch(`${API_URL}?path=groups`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedGroup)
      });
      
      setGroups(prev => prev.map(g => 
        g.id === selectedGroup.id ? selectedGroup : g
      ));
      
      toast.success('Группа обновлена');
      setShowEditGroup(false);
      setSelectedGroup(null);
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  }, [selectedGroup]);

  const handleAddSchedule = useCallback(async () => {
    if (!newSchedule.group || !newSchedule.day || !newSchedule.time || !newSchedule.duration) {
      toast.error('Заполните все поля');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}?path=schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule)
      });
      
      const schedule = await res.json();
      setSchedules(prev => [...prev, schedule]);
      
      toast.success('Тренировка добавлена');
      setNewSchedule({ group: '', day: '', time: '', duration: '' });
      setShowAddSchedule(false);
    } catch (error) {
      toast.error('Ошибка добавления');
    }
  }, [newSchedule]);

  const handleDeleteSchedule = useCallback(async (id: number) => {
    try {
      await fetch(`${API_URL}?path=schedules&id=${id}`, {
        method: 'DELETE'
      });
      
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success('Тренировка удалена');
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  }, []);

  const filteredSchedules = useMemo(() => {
    return selectedGroupForSchedule 
      ? schedules.filter(s => s.group === selectedGroupForSchedule)
      : schedules;
  }, [schedules, selectedGroupForSchedule]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TrainTrack
            </h1>
            <p className="text-sm text-muted-foreground">Учёт посещений</p>
          </div>
          <Button 
            size="icon" 
            className="rounded-full w-12 h-12 pulse-glow"
            onClick={() => setShowAddAthlete(true)}
          >
            <Icon name="Plus" size={24} />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Users" size={20} className="text-primary" />
              <span className="text-xs text-muted-foreground">Всего</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Activity" size={20} className="text-secondary" />
              <span className="text-xs text-muted-foreground">Сегодня</span>
            </div>
            <p className="text-2xl font-bold">{stats.today}</p>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TrendingUp" size={20} className="text-accent" />
              <span className="text-xs text-muted-foreground">Средняя</span>
            </div>
            <p className="text-2xl font-bold">{stats.avg}%</p>
          </Card>
        </div>

        <Tabs defaultValue="athletes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Люди
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Группы
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Icon name="CalendarDays" size={16} />
              План
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="space-y-3 mt-0">
            {athletes.map(athlete => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onCheckIn={handleCheckIn}
                onEdit={(a) => {
                  setSelectedAthlete(a);
                  setShowEditAthlete(true);
                }}
              />
            ))}
          </TabsContent>

          <TabsContent value="groups" className="space-y-3 mt-0">
            {groups.map(group => (
              <GroupCard 
                key={group.id} 
                group={group}
                onEdit={(g) => {
                  setSelectedGroup(g);
                  setShowEditGroup(true);
                }}
                onViewSchedule={(name) => {
                  setSelectedGroupForSchedule(name);
                  setShowSchedule(true);
                }}
              />
            ))}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-3 mt-0">
            <Button 
              className="w-full mb-4"
              onClick={() => setShowAddSchedule(true)}
            >
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить тренировку
            </Button>
            
            {schedules.map(schedule => (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Icon name="CalendarDays" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{schedule.group}</p>
                      <p className="text-sm text-muted-foreground">{schedule.day}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Icon name="Clock" size={14} className="text-muted-foreground" />
                    <span>{schedule.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Icon name="Timer" size={14} className="text-muted-foreground" />
                    <span>{schedule.duration}</span>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t">
          <div className="max-w-md mx-auto flex gap-3">
            <Button 
              className="flex-1 h-14 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80"
              onClick={() => setShowCheckIn(true)}
            >
              <Icon name="CheckCircle2" size={24} className="mr-2" />
              Отметить посещение
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showCheckIn} onOpenChange={setShowCheckIn}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Быстрая отметка</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {athletes.map(athlete => (
              <div 
                key={athlete.id}
                onClick={() => handleCheckIn(athlete.id)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                      {athlete.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{athlete.name}</p>
                    <p className="text-xs text-muted-foreground">{athlete.group}</p>
                  </div>
                </div>
                {athlete.checked && (
                  <Icon name="CheckCircle2" size={24} className="text-primary" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAthlete} onOpenChange={setShowAddAthlete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить спортсмена</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Имя и фамилия</Label>
              <Input
                placeholder="Иван Иванов"
                value={newAthlete.name}
                onChange={(e) => setNewAthlete(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Группа</Label>
              <Select value={newAthlete.group} onValueChange={(v) => setNewAthlete(prev => ({ ...prev, group: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Статус</Label>
              <Select value={newAthlete.status} onValueChange={(v: any) => setNewAthlete(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="injured">Травма</SelectItem>
                  <SelectItem value="rest">Отдых</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAthlete(false)}>Отмена</Button>
            <Button onClick={handleAddAthlete}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditAthlete} onOpenChange={setShowEditAthlete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать спортсмена</DialogTitle>
          </DialogHeader>
          {selectedAthlete && (
            <div className="space-y-4">
              <div>
                <Label>Имя и фамилия</Label>
                <Input
                  value={selectedAthlete.name}
                  onChange={(e) => setSelectedAthlete(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Группа</Label>
                <Select value={selectedAthlete.group} onValueChange={(v) => setSelectedAthlete(prev => prev ? { ...prev, group: v } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус</Label>
                <Select value={selectedAthlete.status} onValueChange={(v: any) => setSelectedAthlete(prev => prev ? { ...prev, status: v } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="injured">Травма</SelectItem>
                    <SelectItem value="rest">Отдых</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAthlete(false)}>Отмена</Button>
            <Button onClick={handleEditAthlete}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать группу</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div>
                <Label>Название группы</Label>
                <Input
                  value={selectedGroup.name}
                  onChange={(e) => setSelectedGroup(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Цвет</Label>
                <Select value={selectedGroup.color} onValueChange={(v) => setSelectedGroup(prev => prev ? { ...prev, color: v } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-primary">Оранжевый</SelectItem>
                    <SelectItem value="bg-secondary">Синий</SelectItem>
                    <SelectItem value="bg-accent">Акцент</SelectItem>
                    <SelectItem value="bg-green-500">Зелёный</SelectItem>
                    <SelectItem value="bg-purple-500">Фиолетовый</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGroup(false)}>Отмена</Button>
            <Button onClick={handleEditGroup}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddSchedule} onOpenChange={setShowAddSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить тренировку</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Группа</Label>
              <Select value={newSchedule.group} onValueChange={(v) => setNewSchedule(prev => ({ ...prev, group: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите группу" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>День недели</Label>
              <Select value={newSchedule.day} onValueChange={(v) => setNewSchedule(prev => ({ ...prev, day: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите день" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Понедельник">Понедельник</SelectItem>
                  <SelectItem value="Вторник">Вторник</SelectItem>
                  <SelectItem value="Среда">Среда</SelectItem>
                  <SelectItem value="Четверг">Четверг</SelectItem>
                  <SelectItem value="Пятница">Пятница</SelectItem>
                  <SelectItem value="Суббота">Суббота</SelectItem>
                  <SelectItem value="Воскресенье">Воскресенье</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Время начала</Label>
              <Input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div>
              <Label>Длительность</Label>
              <Select value={newSchedule.duration} onValueChange={(v) => setNewSchedule(prev => ({ ...prev, duration: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите длительность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60 мин">60 минут</SelectItem>
                  <SelectItem value="90 мин">90 минут</SelectItem>
                  <SelectItem value="120 мин">120 минут</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSchedule(false)}>Отмена</Button>
            <Button onClick={handleAddSchedule}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Расписание: {selectedGroupForSchedule}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSchedules.map(schedule => (
              <Card key={schedule.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{schedule.day}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{schedule.time}</span>
                      <span>{schedule.duration}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {filteredSchedules.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Нет тренировок</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;