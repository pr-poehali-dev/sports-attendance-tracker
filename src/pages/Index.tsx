import { useState, useMemo, useCallback, memo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

const AthleteCard = memo(({ athlete, onCheckIn }: {
  athlete: Athlete;
  onCheckIn: (id: number) => void;
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
      <Button 
        size="icon"
        variant={athlete.checked ? "default" : "outline"}
        onClick={() => onCheckIn(athlete.id)}
        className="rounded-full"
      >
        <Icon name={athlete.checked ? "Check" : "UserPlus"} size={18} />
      </Button>
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

const GroupCard = memo(({ group }: { group: Group }) => (
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
      <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
    </div>
    
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="flex-1">
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
  const [athletes, setAthletes] = useState<Athlete[]>([
    { id: 1, name: 'Алексей Смирнов', group: 'Боксёры', attendance: 95, status: 'active', lastVisit: 'Сегодня' },
    { id: 2, name: 'Мария Петрова', group: 'Борцы', attendance: 88, status: 'active', lastVisit: 'Вчера' },
    { id: 3, name: 'Дмитрий Козлов', group: 'Боксёры', attendance: 72, status: 'injured', lastVisit: '3 дня назад' },
    { id: 4, name: 'Анна Волкова', group: 'Кроссфит', attendance: 91, status: 'active', lastVisit: 'Сегодня' },
    { id: 5, name: 'Иван Соколов', group: 'Борцы', attendance: 65, status: 'rest', lastVisit: '5 дней назад' },
    { id: 6, name: 'Елена Морозова', group: 'Кроссфит', attendance: 98, status: 'active', lastVisit: 'Сегодня' },
  ]);

  const [groups] = useState<Group[]>([
    { id: 1, name: 'Боксёры', count: 12, color: 'bg-primary' },
    { id: 2, name: 'Борцы', count: 8, color: 'bg-secondary' },
    { id: 3, name: 'Кроссфит', count: 15, color: 'bg-accent' },
  ]);

  const [showCheckIn, setShowCheckIn] = useState(false);

  const stats = useMemo(() => {
    const total = athletes.length;
    const today = athletes.filter(a => a.lastVisit === 'Сегодня').length;
    const avg = Math.round(athletes.reduce((acc, a) => acc + a.attendance, 0) / athletes.length);
    return { total, today, avg };
  }, [athletes]);

  const handleCheckIn = useCallback((id: number) => {
    setAthletes(prev => prev.map(a => 
      a.id === id ? { ...a, checked: !a.checked, lastVisit: a.checked ? a.lastVisit : 'Сегодня' } : a
    ));
  }, []);

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
          <Button size="icon" className="rounded-full w-12 h-12 pulse-glow">
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
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="athletes" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Спортсмены
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Icon name="Users" size={16} />
              Группы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="athletes" className="space-y-3 mt-0">
            {athletes.map(athlete => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onCheckIn={handleCheckIn}
              />
            ))}
          </TabsContent>

          <TabsContent value="groups" className="space-y-3 mt-0">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
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
    </div>
  );
};

export default Index;
