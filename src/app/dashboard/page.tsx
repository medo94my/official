'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/dashboard/modal';
import ProjectForm from '@/components/dashboard/forms/ProjectForm';
import SkillForm from '@/components/dashboard/forms/SkillForm';
import ServiceForm from '@/components/dashboard/forms/ServiceForm';
import PersonalInfoForm from '@/components/dashboard/forms/PersonalInfoForm';
import SocialLinkForm from '@/components/dashboard/forms/SocialLinkForm';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [services, setServices] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const projectsRes = await fetch('/api/projects');
    const projectsData = await projectsRes.json();
    setProjects(projectsData);

    const skillsRes = await fetch('/api/skills');
    const skillsData = await skillsRes.json();
    setSkills(skillsData);

    const servicesRes = await fetch('/api/services');
    const servicesData = await servicesRes.json();
    setServices(servicesData);

    const personalInfoRes = await fetch('/api/personal-info');
    const personalInfoData = await personalInfoRes.json();
    setPersonalInfo(personalInfoData);

    const socialLinksRes = await fetch('/api/social-links');
    const socialLinksData = await socialLinksRes.json();
    setSocialLinks(socialLinksData);
  };

  const openModal = (title: string, form: any) => {
    setModalContent({ title, form });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const handleFormSubmit = async (apiPath: string, data: any, method: 'POST' | 'PUT') => {
    const response = await fetch(apiPath, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      fetchData();
      closeModal();
    }
  };

  const handleDelete = async (apiPath: string) => {
    const response = await fetch(apiPath, { method: 'DELETE' });
    if (response.ok) {
      fetchData();
      closeModal();
    }
  };

  // Project Modals
  const addProject = () => openModal('Add Project', <ProjectForm onSubmit={(data) => handleFormSubmit('/api/projects', data, 'POST')} onCancel={closeModal} />);
  const editProject = (project: any) => openModal('Edit Project', <ProjectForm initialData={project} onSubmit={(data) => handleFormSubmit(`/api/projects/${project.id}`, data, 'PUT')} onCancel={closeModal} />);
  const deleteProject = (project: any) => openModal('Delete Project', <div><p>Are you sure you want to delete this project?</p><div className="flex justify-end mt-4"><Button variant="destructive" onClick={() => handleDelete(`/api/projects/${project.id}`)}>Delete</Button></div></div>);

  // Skill Modals
  const addSkill = () => openModal('Add Skill', <SkillForm onSubmit={(data) => handleFormSubmit('/api/skills', data, 'POST')} onCancel={closeModal} />);
  const editSkill = (skill: any) => openModal('Edit Skill', <SkillForm initialData={skill} onSubmit={(data) => handleFormSubmit(`/api/skills/${skill.id}`, data, 'PUT')} onCancel={closeModal} />);
  const deleteSkill = (skill: any) => openModal('Delete Skill', <div><p>Are you sure you want to delete this skill?</p><div className="flex justify-end mt-4"><Button variant="destructive" onClick={() => handleDelete(`/api/skills/${skill.id}`)}>Delete</Button></div></div>);
  
  // Service Modals
  const addService = () => openModal('Add Service', <ServiceForm onSubmit={(data) => handleFormSubmit('/api/services', data, 'POST')} onCancel={closeModal} />);
  const editService = (service: any) => openModal('Edit Service', <ServiceForm initialData={service} onSubmit={(data) => handleFormSubmit(`/api/services/${service.id}`, data, 'PUT')} onCancel={closeModal} />);
  const deleteService = (service: any) => openModal('Delete Service', <div><p>Are you sure you want to delete this service?</p><div className="flex justify-end mt-4"><Button variant="destructive" onClick={() => handleDelete(`/api/services/${service.id}`)}>Delete</Button></div></div>);

  // Personal Info Modal
  const editPersonalInfo = () => openModal('Edit Personal Info', <PersonalInfoForm initialData={personalInfo} onSubmit={(data) => handleFormSubmit('/api/personal-info', data, 'PUT')} onCancel={closeModal} />);

  // Social Link Modals
  const addSocialLink = () => openModal('Add Social Link', <SocialLinkForm onSubmit={(data) => handleFormSubmit('/api/social-links', data, 'POST')} onCancel={closeModal} />);
  const editSocialLink = (link: any) => openModal('Edit Social Link', <SocialLinkForm initialData={link} onSubmit={(data) => handleFormSubmit(`/api/social-links/${link.id}`, data, 'PUT')} onCancel={closeModal} />);
  const deleteSocialLink = (link: any) => openModal('Delete Social Link', <div><p>Are you sure you want to delete this social link?</p><div className="flex justify-end mt-4"><Button variant="destructive" onClick={() => handleDelete(`/api/social-links/${link.id}`)}>Delete</Button></div></div>);


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-10">Dashboard</h1>

      {modalOpen && modalContent && (
        <Modal title={modalContent.title} onClose={closeModal}>
          {modalContent.form}
        </Modal>
      )}

      <div className="grid gap-8">
        {/* Personal Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Info</CardTitle>
            <Button variant="outline" size="sm" onClick={editPersonalInfo}><Pencil className="mr-2 h-4 w-4" />Edit</Button>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {(personalInfo as any).name}</p>
            <p><strong>Bio:</strong> {(personalInfo as any).bio}</p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button size="sm" onClick={addProject}><PlusCircle className="mr-2 h-4 w-4" />Add Project</Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project: any) => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      {project.name}
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => editProject(project)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProject(project)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills</CardTitle>
              <Button size="sm" onClick={addSkill}><PlusCircle className="mr-2 h-4 w-4" />Add Skill</Button>
            </CardHeader>
            <CardContent>
              {skills.map((skill: any) => (
                <div key={skill.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
                  <h3 className="font-semibold">{skill.name} - {skill.level}%</h3>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => editSkill(skill)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSkill(skill)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Button size="sm" onClick={addService}><PlusCircle className="mr-2 h-4 w-4" />Add Service</Button>
            </CardHeader>
            <CardContent>
              {services.map((service: any) => (
                <div key={service.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
                  <p>{service.name}</p>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => editService(service)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteService(service)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Social Links */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Social Links</CardTitle>
            <Button size="sm" onClick={addSocialLink}><PlusCircle className="mr-2 h-4 w-4" />Add Social Link</Button>
          </CardHeader>
          <CardContent>
            {socialLinks.map((link: any) => (
              <div key={link.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted">
                <div>
                  <h3 className="font-semibold">{link.name}</h3>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500">{link.url}</a>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => editSocialLink(link)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteSocialLink(link)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
